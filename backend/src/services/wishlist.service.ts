import prisma from "../config/database.js";
import { addWishlistItemSchema } from "../validators/wishlist.validator.js";

export const getWishlist = async (userId: string) => {
  const wishlist = await prisma.wishlist.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  if (!wishlist) {
    return {
      id: null,
      items: [],
    };
  }

  return wishlist;
};

export const addWishlistItem = async (userId: string, productId: string) => {
  const product = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!product) {
    throw new Error("Product not found");
  }

  if (product.status !== "APPROVED" || !product.isActive) {
    throw new Error("Product is not available");
  }

  let wishlist = await prisma.wishlist.findUnique({
    where: { userId },
  });

  if (!wishlist) {
    wishlist = await prisma.wishlist.create({
      data: { userId },
    });
  }

  const existingItem = await prisma.wishlistItem.findFirst({
    where: {
      wishlistId: wishlist.id,
      productId,
    },
  });

  if (existingItem) {
    throw new Error("Product already in wishlist");
  }

  const item = await prisma.wishlistItem.create({
    data: {
      wishlistId: wishlist.id,
      productId,
    },
    include: {
      product: true,
    },
  });

  return item;
};

export const removeWishlistItem = async (userId: string, productId: string) => {
  const wishlist = await prisma.wishlist.findUnique({
    where: { userId },
  });

  if (!wishlist) {
    throw new Error("Wishlist not found");
  }

  const item = await prisma.wishlistItem.findFirst({
    where: {
      wishlistId: wishlist.id,
      productId,
    },
  });

  if (!item) {
    throw new Error("Wishlist item not found");
  }

  await prisma.wishlistItem.delete({ where: { id: item.id } });

  return { id: item.id };
};

export const checkWishlistItem = async (userId: string, productId: string) => {
  const wishlist = await prisma.wishlist.findUnique({
    where: { userId },
  });

  if (!wishlist) {
    return { isWishlisted: false };
  }

  const item = await prisma.wishlistItem.findFirst({
    where: {
      wishlistId: wishlist.id,
      productId,
    },
  });

  return { isWishlisted: Boolean(item) };
};

export const clearWishlist = async (userId: string) => {
  const wishlist = await prisma.wishlist.findUnique({
    where: { userId },
  });

  if (!wishlist) {
    return { deleted: 0 };
  }

  const result = await prisma.wishlistItem.deleteMany({
    where: { wishlistId: wishlist.id },
  });

  return { deleted: result.count };
};
