import prisma from "../config/database.js";
import {
  CreateShopInput,
  UpdateShopInput,
  ShopSearchInput,
} from "../validators/shop.validator.js";
import { verifyActiveSeller } from "./seller.service.js";

export const createShop = async (
  data: CreateShopInput,
  sellerId: string
) => {
  await verifyActiveSeller(sellerId);

  const existingShop = await prisma.shop.findUnique({
    where: {
      sellerId,
    },
  });

  if (existingShop) {
    throw new Error("Seller already has a shop");
  }

  const existingName = await prisma.shop.findUnique({
    where: {
      name: data.name,
    },
  });

  if (existingName) {
    throw new Error("Shop name already exists");
  }

  const existingSlug = await prisma.shop.findUnique({
    where: {
      slug: data.slug,
    },
  });

  if (existingSlug) {
    throw new Error("Shop slug already exists");
  }

  return await prisma.shop.create({
    data: {
      name: data.name,
      slug: data.slug,
      logo: data.logo,
      banner: data.banner,
      description: data.description,
      sellerId,
    },
  });
};

export const getShops = async (query: ShopSearchInput = {}) => {
  const search = query.search?.trim();

  return await prisma.shop.findMany({
    where: {
      seller: {
        role: "SELLER",
        sellerStatus: "APPROVED",
      },
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { slug: { contains: search, mode: "insensitive" } },
              { description: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
      ...(query.categoryId
        ? { products: { some: { categoryId: query.categoryId, status: "APPROVED", isActive: true } } }
        : {}),
    },
    include: {
      seller: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const getShopById = async (shopId: string) => {
  const shop = await prisma.shop.findUnique({
    where: {
      id: shopId,
    },
    include: {
      seller: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  if (!shop) {
    throw new Error("Shop not found");
  }

  return shop;
};

export const getShopBySellerId = async (sellerId: string) => {
  const shop = await prisma.shop.findUnique({
    where: {
      sellerId,
    },
    include: {
      seller: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  if (!shop) {
    throw new Error("Shop not found");
  }

  return shop;
};

export const updateShop = async (
  shopId: string,
  userId: string,
  role: string,
  data: UpdateShopInput
) => {
  const shop = await prisma.shop.findUnique({
    where: {
      id: shopId,
    },
  });

  if (!shop) {
    throw new Error("Shop not found");
  }

  if (role === "SELLER") {
    await verifyActiveSeller(userId);

    if (shop.sellerId !== userId) {
      throw new Error("Access denied");
    }
  }

  if (data.name && data.name !== shop.name) {
    const existingName = await prisma.shop.findUnique({
      where: {
        name: data.name,
      },
    });

    if (existingName) {
      throw new Error("Shop name already exists");
    }
  }

  if (data.slug && data.slug !== shop.slug) {
    const existingSlug = await prisma.shop.findUnique({
      where: {
        slug: data.slug,
      },
    });

    if (existingSlug) {
      throw new Error("Shop slug already exists");
    }
  }

  return await prisma.shop.update({
    where: {
      id: shopId,
    },
    data,
    include: {
      seller: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
};

export const deleteShop = async (shopId: string) => {
  const shop = await prisma.shop.findUnique({
    where: {
      id: shopId,
    },
  });

  if (!shop) {
    throw new Error("Shop not found");
  }

  await prisma.shop.delete({
    where: {
      id: shopId,
    },
  });
};
