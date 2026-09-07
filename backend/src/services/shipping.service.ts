import { Decimal } from "@prisma/client/runtime/client";
import prisma from "../config/database.js";

export interface ShippingAddressQuery {
  country: string;
  state?: string | null;
  city: string;
  postalCode?: string | null;
}

export interface VendorSubtotalItem {
  shopId: string;
  subtotal: Decimal;
}

// Seed default shipping zones if none exist
export const ensureDefaultShippingZones = async () => {
  const count = await prisma.shippingZone.count();
  if (count > 0) return;

  const defaultZones = [
    {
      name: "Local Zone",
      description: "Local city delivery",
      countries: ["*"],
      states: ["*"],
      cities: ["*"],
      postalCodes: ["*"],
      shippingCharge: new Decimal(0),
      isFreeShipping: true,
      freeShippingMinAmount: new Decimal(0),
      isActive: true,
    },
    {
      name: "Standard Regional Zone",
      description: "Regional shipping rate",
      countries: ["*"],
      states: ["*"],
      cities: ["*"],
      postalCodes: ["*"],
      shippingCharge: new Decimal(5.0),
      isFreeShipping: false,
      freeShippingMinAmount: new Decimal(100.0),
      isActive: true,
    },
  ];

  for (const zone of defaultZones) {
    await prisma.shippingZone.create({
      data: zone,
    });
  }
};

const matchesList = (val: string | null | undefined, list: any): boolean => {
  if (!Array.isArray(list) || list.length === 0) return true;
  if (list.includes("*")) return true;
  if (!val) return false;
  const normalizedVal = val.trim().toLowerCase();
  return list.some((item: any) => typeof item === "string" && item.trim().toLowerCase() === normalizedVal);
};

export const findMatchingShippingZone = async (address: ShippingAddressQuery) => {
  await ensureDefaultShippingZones();

  const activeZones = await prisma.shippingZone.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "asc" },
  });

  if (activeZones.length === 0) {
    return null;
  }

  // Score each zone by specificity to find the best match
  let bestMatch: (typeof activeZones)[0] | null = null;
  let highestScore = -1;

  for (const zone of activeZones) {
    const countries = zone.countries as string[];
    const states = zone.states as string[];
    const cities = zone.cities as string[];
    const postalCodes = zone.postalCodes as string[];

    const countryMatch = matchesList(address.country, countries);
    const stateMatch = matchesList(address.state, states);
    const cityMatch = matchesList(address.city, cities);
    const postalMatch = matchesList(address.postalCode, postalCodes);

    if (countryMatch && stateMatch && cityMatch && postalMatch) {
      let score = 0;
      if (Array.isArray(cities) && !cities.includes("*")) score += 8;
      if (Array.isArray(states) && !states.includes("*")) score += 4;
      if (Array.isArray(postalCodes) && !postalCodes.includes("*")) score += 2;
      if (Array.isArray(countries) && !countries.includes("*")) score += 1;

      if (score > highestScore) {
        highestScore = score;
        bestMatch = zone;
      }
    }
  }

  return bestMatch;
};

export const calculateShippingQuote = async (
  address: ShippingAddressQuery,
  vendorSubtotals: VendorSubtotalItem[]
) => {
  const zone = await findMatchingShippingZone(address);

  if (!zone) {
    return {
      isDeliverable: false,
      matchedZone: null,
      totalShippingAmount: new Decimal(0),
      vendorShippingMap: {} as Record<string, Decimal>,
      message: "Sorry, we currently don't deliver to this location.",
    };
  }

  const vendorShippingMap: Record<string, Decimal> = {};
  let totalShippingAmount = new Decimal(0);

  for (const vendor of vendorSubtotals) {
    let vendorShipping = new Decimal(zone.shippingCharge);

    // Free shipping check per vendor subtotal
    if (zone.isFreeShipping) {
      vendorShipping = new Decimal(0);
    } else if (zone.freeShippingMinAmount !== null && zone.freeShippingMinAmount !== undefined) {
      if (vendor.subtotal.gte(zone.freeShippingMinAmount)) {
        vendorShipping = new Decimal(0);
      }
    }

    vendorShippingMap[vendor.shopId] = vendorShipping;
    totalShippingAmount = totalShippingAmount.add(vendorShipping);
  }

  return {
    isDeliverable: true,
    matchedZone: {
      id: zone.id,
      name: zone.name,
      shippingCharge: zone.shippingCharge,
      isFreeShipping: zone.isFreeShipping,
      freeShippingMinAmount: zone.freeShippingMinAmount,
    },
    totalShippingAmount,
    vendorShippingMap,
    message: "Shipping calculated successfully",
  };
};

// Admin CRUD functions
export const getAllShippingZones = async () => {
  await ensureDefaultShippingZones();
  return prisma.shippingZone.findMany({
    orderBy: { createdAt: "desc" },
  });
};

export const getShippingZoneById = async (id: string) => {
  const zone = await prisma.shippingZone.findUnique({ where: { id } });
  if (!zone) throw new Error("Shipping zone not found");
  return zone;
};

export const createShippingZone = async (data: {
  name: string;
  description?: string | null;
  countries?: string[];
  states?: string[];
  cities?: string[];
  postalCodes?: string[];
  shippingCharge: number | Decimal;
  isFreeShipping?: boolean;
  freeShippingMinAmount?: number | Decimal | null;
  isActive?: boolean;
}) => {
  return prisma.shippingZone.create({
    data: {
      name: data.name,
      description: data.description || null,
      countries: data.countries || ["*"],
      states: data.states || ["*"],
      cities: data.cities || ["*"],
      postalCodes: data.postalCodes || ["*"],
      shippingCharge: new Decimal(data.shippingCharge),
      isFreeShipping: data.isFreeShipping ?? false,
      freeShippingMinAmount:
        data.freeShippingMinAmount !== null && data.freeShippingMinAmount !== undefined
          ? new Decimal(data.freeShippingMinAmount)
          : null,
      isActive: data.isActive ?? true,
    },
  });
};

export const updateShippingZone = async (
  id: string,
  data: {
    name?: string;
    description?: string | null;
    countries?: string[];
    states?: string[];
    cities?: string[];
    postalCodes?: string[];
    shippingCharge?: number | Decimal;
    isFreeShipping?: boolean;
    freeShippingMinAmount?: number | Decimal | null;
    isActive?: boolean;
  }
) => {
  const existing = await prisma.shippingZone.findUnique({ where: { id } });
  if (!existing) throw new Error("Shipping zone not found");

  const updateData: any = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.countries !== undefined) updateData.countries = data.countries;
  if (data.states !== undefined) updateData.states = data.states;
  if (data.cities !== undefined) updateData.cities = data.cities;
  if (data.postalCodes !== undefined) updateData.postalCodes = data.postalCodes;
  if (data.shippingCharge !== undefined) updateData.shippingCharge = new Decimal(data.shippingCharge);
  if (data.isFreeShipping !== undefined) updateData.isFreeShipping = data.isFreeShipping;
  if (data.freeShippingMinAmount !== undefined) {
    updateData.freeShippingMinAmount =
      data.freeShippingMinAmount !== null ? new Decimal(data.freeShippingMinAmount) : null;
  }
  if (data.isActive !== undefined) updateData.isActive = data.isActive;

  return prisma.shippingZone.update({
    where: { id },
    data: updateData,
  });
};

export const deleteShippingZone = async (id: string) => {
  const existing = await prisma.shippingZone.findUnique({ where: { id } });
  if (!existing) throw new Error("Shipping zone not found");
  return prisma.shippingZone.delete({ where: { id } });
};
