import prisma from "../config/database.js";

export interface AddressInput {
  fullName: string;
  phone: string;
  address: string;
  unit?: string | null;
  city: string;
  state?: string | null;
  postalCode?: string | null;
  country?: string;
  isDefault?: boolean;
}

export const getUserAddresses = async (userId: string) => {
  return prisma.address.findMany({
    where: { userId },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });
};

export const createUserAddress = async (userId: string, data: AddressInput) => {
  if (data.isDefault) {
    await prisma.address.updateMany({
      where: { userId },
      data: { isDefault: false },
    });
  }

  const existingCount = await prisma.address.count({ where: { userId } });
  const isDefault = existingCount === 0 ? true : Boolean(data.isDefault);

  return prisma.address.create({
    data: {
      userId,
      fullName: data.fullName,
      phone: data.phone,
      address: data.address,
      unit: data.unit || null,
      city: data.city,
      state: data.state || null,
      postalCode: data.postalCode || null,
      country: data.country || "Pakistan",
      isDefault,
    },
  });
};

export const deleteUserAddress = async (userId: string, addressId: string) => {
  const existing = await prisma.address.findUnique({ where: { id: addressId } });
  if (!existing || existing.userId !== userId) {
    throw new Error("Address not found or access denied");
  }
  return prisma.address.delete({ where: { id: addressId } });
};
