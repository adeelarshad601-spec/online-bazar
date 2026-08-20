import prisma from "../config/database.js";
import {
  CreateProductInput,
  UpdateProductInput,
} from "../validators/product.validator.js";
import { verifyActiveSeller } from "./seller.service.js";

export const createProduct = async (
  data: CreateProductInput,
  userId: string,
  role: string
) => {
  if (role !== "ADMIN") {
    await verifyActiveSeller(userId);

    const shop = await prisma.shop.findUnique({
      where: {
        sellerId: userId,
      },
    });

    if (!shop) {
      throw new Error("Seller shop not found");
    }

    data.shopId = shop.id;
  }

  const existingSku = await prisma.product.findUnique({
    where: {
      sku: data.sku,
    },
  });

  if (existingSku) {
    throw new Error("SKU already exists");
  }

  const existingSlug = await prisma.product.findUnique({
    where: {
      slug: data.slug,
    },
  });

  if (existingSlug) {
    throw new Error("Slug already exists");
  }

  const product = await prisma.product.create({
    data: {
      title: data.title,
      slug: data.slug,
      description: data.description,
      sku: data.sku,
      price: data.price,
      compareAtPrice: data.compareAtPrice,
      stock: data.stock,
      shopId: data.shopId,
      categoryId: data.categoryId,

      images: data.images?.length
        ? {
            create: data.images.map((url, index) => ({
              url,
              isPrimary: index === 0,
              sortOrder: index,
            })),
          }
        : undefined,

      // Seller products need admin approval
      status: role === "ADMIN" ? "APPROVED" : "PENDING",
    },

    include: {
      shop: true,
      category: true,
    },
  });

  return product;
};

// Get all products
export const getProducts = async () => {
  return await prisma.product.findMany({
    where: {
      status: "APPROVED",
      isActive: true,
    },

    include: {
      shop: {
        select: {
          id: true,
          name: true,
          slug: true,
          logo: true,
        },
      },

      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },

      images: {
        orderBy: {
          sortOrder: "asc",
        },
      },
    },

    orderBy: {
      createdAt: "desc",
    },
  });
};

//single product

export const getProductById = async (productId: string) => {
  const product = await prisma.product.findFirst({
    where: {
      id: productId,
      status: "APPROVED",
      isActive: true,
    },

    include: {
      shop: true,
      category: true,
      images: {
        orderBy: {
          sortOrder: "asc",
        },
      },
      variants: true,
    },
  });

  if (!product) {
    throw new Error("Product not found");
  }

  return product;
};

// Update product
export const updateProduct = async (
  productId: string,
  userId: string,
  role: string,
  data: UpdateProductInput
) => {
  const product = await prisma.product.findUnique({
    where: {
      id: productId,
    },

    include: {
      shop: true,
    },
  });

  if (!product) {
    throw new Error("Product not found");
  }

  if (role === "SELLER") {
    await verifyActiveSeller(userId);

    if (product.shop.sellerId !== userId) {
      throw new Error("Access denied");
    }
  }

  if (data.slug && data.slug !== product.slug) {
    const existingSlug = await prisma.product.findUnique({
      where: {
        slug: data.slug,
      },
    });

    if (existingSlug) {
      throw new Error("Slug already exists");
    }
  }

  if (data.sku && data.sku !== product.sku) {
    const existingSku = await prisma.product.findUnique({
      where: {
        sku: data.sku,
      },
    });

    if (existingSku) {
      throw new Error("SKU already exists");
    }
  }

  return await prisma.product.update({
    where: {
      id: productId,
    },

    data: {
      ...data,

      // Seller update requires approval again
      ...(role === "SELLER" && {
        status: "PENDING",
      }),
    },

    include: {
      shop: true,
      category: true,
    },
  });
};

// Delete product
export const deleteProduct = async (
  productId: string,
  userId: string,
  role: string
) => {
  const product = await prisma.product.findUnique({
    where: {
      id: productId,
    },

    include: {
      shop: true,
    },
  });

  if (!product) {
    throw new Error("Product not found");
  }

  if (role === "SELLER") {
    await verifyActiveSeller(userId);

    if (product.shop.sellerId !== userId) {
      throw new Error("Access denied");
    }
  }

  await prisma.product.delete({
    where: {
      id: productId,
    },
  });
};

// admin status update
export const updateProductStatus = async (
  productId: string,
  status:
    | "PENDING"
    | "APPROVED"
    | "REJECTED"
    | "SUSPENDED"
) => {
  const product = await prisma.product.findUnique({
    where: {
      id: productId,
    },
  });

  if (!product) {
    throw new Error("Product not found");
  }

  return await prisma.product.update({
    where: {
      id: productId,
    },

    data: {
      status,
    },
  });
};