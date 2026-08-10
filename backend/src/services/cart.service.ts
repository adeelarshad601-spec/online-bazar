import prisma from "../config/database.js";
import { Decimal } from "@prisma/client/runtime/client";

const mapCart = (cart: any) => {
  const items = cart.items.map((item: any) => {
    const product = item.product;
    const variant = item.variant;
    const price = variant?.price ?? product.price;
    const subtotal = price.mul(item.quantity);

    return {
      id: item.id,
      quantity: item.quantity,
      product: {
        id: product.id,
        title: product.title,
        slug: product.slug,
        price: product.price,
        stock: product.stock,
        images: product.images,
      },
      variant: variant
        ? {
            id: variant.id,
            price: variant.price,
            stock: variant.stock,
            isActive: variant.isActive,
          }
        : null,
      price,
      subtotal,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
  });

  const totalAmount = items.reduce(
    (sum: Decimal, item: any) => sum.add(item.subtotal),
    new Decimal(0)
  );

  return {
    id: cart.id,
    items,
    totalItems: items.length,
    totalAmount,
  };
};

export const getOrCreateCart = async (userId: string) => {
  const cart = await prisma.cart.upsert({
    where: { userId },
    create: {
      userId,
    },
    update: {},
    include: {
      items: {
        include: {
          product: {
            include: {
              images: true,
            },
          },
          variant: true,
        },
      },
    },
  });

  return mapCart(cart);
};

const validateProduct = async (productId: string) => {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      images: true,
    },
  });

  if (!product) {
    throw new Error("Product not found");
  }

  if (product.status !== "APPROVED" || !product.isActive) {
    throw new Error("Product is not available");
  }

  if (product.stock <= 0) {
    throw new Error("Product is out of stock");
  }

  return product;
};

const validateVariant = async (
  productId: string,
  variantId: string
) => {
  const variant = await prisma.productVariant.findUnique({
    where: { id: variantId },
  });

  if (!variant) {
    throw new Error("Variant not found");
  }

  if (variant.productId !== productId) {
    throw new Error("Variant does not belong to product");
  }

  if (!variant.isActive) {
    throw new Error("Variant is not available");
  }

  if (variant.stock <= 0) {
    throw new Error("Variant is out of stock");
  }

  return variant;
};

const getCartForUser = async (userId: string) => {
  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          product: {
            include: {
              images: true,
            },
          },
          variant: true,
        },
      },
    },
  });

  return cart;
};

export const addItemToCart = async (
  userId: string,
  productId: string,
  variantId: string | undefined,
  quantity: number
) => {
  const product = await validateProduct(productId);
  let variant = null;
  let availableStock = product.stock;

  if (variantId) {
    variant = await validateVariant(productId, variantId);
    availableStock = variant.stock;
  }

  if (quantity > availableStock) {
    throw new Error("Quantity exceeds available stock");
  }

  const cart = await prisma.cart.upsert({
    where: { userId },
    create: { userId },
    update: {},
  });

  const existingItem = await prisma.cartItem.findFirst({
    where: {
      cartId: cart.id,
      productId,
      variantId: variantId ?? null,
    },
  });

  if (existingItem) {
    const newQuantity = existingItem.quantity + quantity;

    if (newQuantity > availableStock) {
      throw new Error("Quantity exceeds available stock");
    }

    await prisma.cartItem.update({
      where: { id: existingItem.id },
      data: { quantity: newQuantity },
    });
  } else {
    await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId,
        variantId: variantId ?? null,
        quantity,
      },
    });
  }

  const updatedCart = await getCartForUser(userId);

  if (!updatedCart) {
    throw new Error("Cart not found");
  }

  return mapCart(updatedCart);
};

export const updateCartItemQuantity = async (
  userId: string,
  cartItemId: string,
  quantity: number
) => {
  const cartItem = await prisma.cartItem.findUnique({
    where: { id: cartItemId },
    include: {
      cart: true,
      product: true,
      variant: true,
    },
  });

  if (!cartItem) {
    throw new Error("Cart item not found");
  }

  if (cartItem.cart.userId !== userId) {
    throw new Error("Unauthorized cart item access");
  }

  const product = await validateProduct(cartItem.productId);
  let availableStock = product.stock;

  if (cartItem.variantId) {
    if (!cartItem.variant) {
      throw new Error("Variant not found");
    }
    const variant = await validateVariant(
      cartItem.productId,
      cartItem.variantId
    );
    availableStock = variant.stock;
  }

  if (quantity > availableStock) {
    throw new Error("Quantity exceeds available stock");
  }

  await prisma.cartItem.update({
    where: { id: cartItemId },
    data: { quantity },
  });

  const updatedCart = await getCartForUser(userId);

  if (!updatedCart) {
    throw new Error("Cart not found");
  }

  return mapCart(updatedCart);
};

export const removeCartItem = async (
  userId: string,
  cartItemId: string
) => {
  const cartItem = await prisma.cartItem.findUnique({
    where: { id: cartItemId },
    include: { cart: true },
  });

  if (!cartItem) {
    throw new Error("Cart item not found");
  }

  if (cartItem.cart.userId !== userId) {
    throw new Error("Unauthorized cart item access");
  }

  await prisma.cartItem.delete({
    where: { id: cartItemId },
  });

  const updatedCart = await getCartForUser(userId);

  if (!updatedCart) {
    throw new Error("Cart not found");
  }

  return mapCart(updatedCart);
};

export const clearCart = async (userId: string) => {
  const cart = await prisma.cart.findUnique({
    where: { userId },
  });

  if (!cart) {
    throw new Error("Cart not found");
  }

  await prisma.cartItem.deleteMany({
    where: { cartId: cart.id },
  });

  return {
    id: cart.id,
    items: [],
    totalItems: 0,
    totalAmount: new Decimal(0),
  };
};
