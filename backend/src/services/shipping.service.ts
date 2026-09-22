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
  totalWeight?: Decimal | number;
  origin?: {
    address?: string | null;
    city?: string | null;
    state?: string | null;
    country?: string | null;
    postalCode?: string | null;
  } | null;
}

// Seed default shipping zones if none exist
export const ensureDefaultShippingZones = async () => {
  const count = await prisma.shippingZone.count();
  if (count > 0) return;

  const defaultZones = [
    {
      name: "Same-City Express Delivery",
      description: "Local intra-city delivery rate",
      originCountries: ["*"],
      originStates: ["*"],
      originCities: ["*"],
      countries: ["*"],
      states: ["*"],
      cities: ["*"],
      postalCodes: ["*"],
      shippingCharge: new Decimal(3.0),
      ratePerKg: new Decimal(0.5),
      isFreeShipping: false,
      freeShippingMinAmount: new Decimal(75.0),
      isActive: true,
    },
    {
      name: "Standard Regional & Inter-City Zone",
      description: "Standard multi-city delivery rate",
      originCountries: ["*"],
      originStates: ["*"],
      originCities: ["*"],
      countries: ["*"],
      states: ["*"],
      cities: ["*"],
      postalCodes: ["*"],
      shippingCharge: new Decimal(5.0),
      ratePerKg: new Decimal(1.0),
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
  if (!list || !Array.isArray(list) || list.length === 0) return true;
  if (list.includes("*")) return true;
  if (!val) return false;
  const normalizedVal = val.trim().toLowerCase();
  return list.some((item: any) => typeof item === "string" && item.trim().toLowerCase() === normalizedVal);
};

export const findMatchingShippingZoneForVendor = async (
  origin: { country?: string | null; state?: string | null; city?: string | null } | undefined | null,
  destination: ShippingAddressQuery
) => {
  await ensureDefaultShippingZones();

  const activeZones = await prisma.shippingZone.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "asc" },
  });

  if (activeZones.length === 0) {
    return null;
  }

  let bestMatch: (typeof activeZones)[0] | null = null;
  let highestScore = -1;

  const originCountry = origin?.country || "Pakistan";
  const originState = origin?.state || "*";
  const originCity = origin?.city || "*";

  for (const zone of activeZones) {
    const origCountries = (zone.originCountries as string[]) || ["*"];
    const origStates = (zone.originStates as string[]) || ["*"];
    const origCities = (zone.originCities as string[]) || ["*"];

    const destCountries = (zone.countries as string[]) || ["*"];
    const destStates = (zone.states as string[]) || ["*"];
    const destCities = (zone.cities as string[]) || ["*"];
    const destPostalCodes = (zone.postalCodes as string[]) || ["*"];

    // Match origin
    const matchOrigCountry = matchesList(originCountry, origCountries);
    const matchOrigState = matchesList(originState, origStates);
    const matchOrigCity = matchesList(originCity, origCities);

    // Match destination
    const matchDestCountry = matchesList(destination.country, destCountries);
    const matchDestState = matchesList(destination.state, destStates);
    const matchDestCity = matchesList(destination.city, destCities);
    const matchDestPostal = matchesList(destination.postalCode, destPostalCodes);

    if (
      matchOrigCountry &&
      matchOrigState &&
      matchOrigCity &&
      matchDestCountry &&
      matchDestState &&
      matchDestCity &&
      matchDestPostal
    ) {
      let score = 0;

      // Specificity scoring
      if (!origCities.includes("*")) score += 16;
      if (!destCities.includes("*")) score += 8;
      if (!origStates.includes("*")) score += 4;
      if (!destStates.includes("*")) score += 4;
      if (!destPostalCodes.includes("*")) score += 2;
      if (!destCountries.includes("*")) score += 1;

      // Same city origin == destination bonus if both specified
      if (
        originCity &&
        destination.city &&
        originCity.trim().toLowerCase() === destination.city.trim().toLowerCase()
      ) {
        score += 5;
      }

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
  const vendorShippingMap: Record<string, Decimal> = {};
  const vendorZoneMap: Record<string, any> = {};
  let totalShippingAmount = new Decimal(0);
  let isAllDeliverable = true;

  for (const vendor of vendorSubtotals) {
    const zone = await findMatchingShippingZoneForVendor(vendor.origin, address);

    if (!zone) {
      isAllDeliverable = false;
      vendorShippingMap[vendor.shopId] = new Decimal(0);
      continue;
    }

    vendorZoneMap[vendor.shopId] = {
      id: zone.id,
      name: zone.name,
      shippingCharge: zone.shippingCharge,
      ratePerKg: zone.ratePerKg || new Decimal(0),
      isFreeShipping: zone.isFreeShipping,
      freeShippingMinAmount: zone.freeShippingMinAmount,
    };

    let vendorShipping = new Decimal(zone.shippingCharge);

    // Add weight-based rate if applicable
    const weightDec = vendor.totalWeight ? new Decimal(vendor.totalWeight) : new Decimal(0);
    if (zone.ratePerKg && weightDec.gt(0)) {
      vendorShipping = vendorShipping.add(new Decimal(zone.ratePerKg).mul(weightDec));
    }

    // Evaluate free shipping for this specific vendor scope
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

  if (!isAllDeliverable) {
    return {
      isDeliverable: false,
      matchedZone: null,
      totalShippingAmount: new Decimal(0),
      vendorShippingMap: {} as Record<string, Decimal>,
      vendorZoneMap: {},
      message: "Sorry, we currently don't deliver to this location.",
    };
  }

  const primaryZone = Object.values(vendorZoneMap)[0] || null;

  return {
    isDeliverable: true,
    matchedZone: primaryZone,
    totalShippingAmount,
    vendorShippingMap,
    vendorZoneMap,
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
  originCountries?: string[];
  originStates?: string[];
  originCities?: string[];
  countries?: string[];
  states?: string[];
  cities?: string[];
  postalCodes?: string[];
  shippingCharge: number | Decimal;
  ratePerKg?: number | Decimal | null;
  isFreeShipping?: boolean;
  freeShippingMinAmount?: number | Decimal | null;
  isActive?: boolean;
}) => {
  return prisma.shippingZone.create({
    data: {
      name: data.name,
      description: data.description || null,
      originCountries: data.originCountries || ["*"],
      originStates: data.originStates || ["*"],
      originCities: data.originCities || ["*"],
      countries: data.countries || ["*"],
      states: data.states || ["*"],
      cities: data.cities || ["*"],
      postalCodes: data.postalCodes || ["*"],
      shippingCharge: new Decimal(data.shippingCharge),
      ratePerKg:
        data.ratePerKg !== null && data.ratePerKg !== undefined ? new Decimal(data.ratePerKg) : new Decimal(0),
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
    originCountries?: string[];
    originStates?: string[];
    originCities?: string[];
    countries?: string[];
    states?: string[];
    cities?: string[];
    postalCodes?: string[];
    shippingCharge?: number | Decimal;
    ratePerKg?: number | Decimal | null;
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
  if (data.originCountries !== undefined) updateData.originCountries = data.originCountries;
  if (data.originStates !== undefined) updateData.originStates = data.originStates;
  if (data.originCities !== undefined) updateData.originCities = data.originCities;
  if (data.countries !== undefined) updateData.countries = data.countries;
  if (data.states !== undefined) updateData.states = data.states;
  if (data.cities !== undefined) updateData.cities = data.cities;
  if (data.postalCodes !== undefined) updateData.postalCodes = data.postalCodes;
  if (data.shippingCharge !== undefined) updateData.shippingCharge = new Decimal(data.shippingCharge);
  if (data.ratePerKg !== undefined) {
    updateData.ratePerKg = data.ratePerKg !== null ? new Decimal(data.ratePerKg) : new Decimal(0);
  }
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
