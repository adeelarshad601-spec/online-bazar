import prisma from "../config/database.js";
import {
  CreateProductInput,
  UpdateProductInput,
} from "../validators/product.validator.js";
import { verifyActiveSeller } from "./seller.service.js";
import { createNotification } from "./notification.service.js";

export const createProduct = async (
  data: CreateProductInput,
  userId: string,
  role: string
) => {
  const { variants: incomingVariants, images: incomingImages, ...productData } = data;

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
      ...productData,

      images: incomingImages?.length
        ? {
            create: incomingImages.map((url, index) => ({
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

  if (incomingVariants?.length) {
    await prisma.productVariant.createMany({
      data: incomingVariants.map((variant, index) => ({
        productId: product.id,
        name: variant.name ?? product.title,
        sku: variant.sku ?? `${product.sku}-${index + 1}`,
        options: (variant.options ?? {}) as any,
        price: variant.price ?? product.price,
        stock: variant.stock ?? product.stock,
      })),
    });
  }

  if (role !== "ADMIN") {
    const admins = await prisma.user.findMany({
      where: { role: "ADMIN" },
      select: { id: true },
    });

    await Promise.all(
      admins.map((admin) =>
        createNotification({
          userId: admin.id,
          type: "PRODUCT",
          title: "New product submitted for approval",
          message: `${product.title} from ${product.shop.name} is waiting for moderation.`,
          actionUrl: `/admin/products?status=PENDING`,
        })
      )
    );
  }

  return product;
};

export const getAdminProducts = async () => {
  return prisma.product.findMany({
    include: {
      shop: true,
      category: true,
      images: { orderBy: { sortOrder: "asc" } },
    },
    orderBy: { createdAt: "desc" },
  });
};

// Get all products
export const getProducts = async () => {
  const products = await prisma.product.findMany({
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

      reviews: {
        select: {
          rating: true,
        },
      },
    },

    orderBy: {
      createdAt: "desc",
    },
  });

  return products.map((product) => {
    const { reviews, ...rest } = product;
    const reviewCount = reviews.length;
    const avgRating =
      reviewCount > 0
        ? Number((reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount).toFixed(1))
        : 0;

    return {
      ...rest,
      rating: avgRating,
      reviewCount,
    };
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
      reviews: {
        select: {
          rating: true,
        },
      },
    },
  });

  if (!product) {
    throw new Error("Product not found");
  }

  const { reviews, ...rest } = product;
  const reviewCount = reviews.length;
  const avgRating =
    reviewCount > 0
      ? Number((reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount).toFixed(1))
      : 0;

  return {
    ...rest,
    rating: avgRating,
    reviewCount,
  };
};

// Update product
export const updateProduct = async (
  productId: string,
  userId: string,
  role: string,
  data: UpdateProductInput
) => {
  const { images: incomingImages, variants: incomingVariants, ...productData } = data;
  const product = await prisma.product.findUnique({
    where: {
      id: productId,
    },

    include: {
      shop: true,
      variants: true,
      images: true,
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

  const existingVariants = product.variants ?? [];
  const existingVariantMap = new Map(existingVariants.map((variant) => [variant.id, variant]));

  if (incomingImages !== undefined) {
    await prisma.productImage.deleteMany({
      where: { productId },
    });

    if (incomingImages.length > 0) {
      await prisma.productImage.createMany({
        data: incomingImages.map((url, index) => ({
          productId,
          url,
          sortOrder: index,
          isPrimary: index === 0,
        })),
      });
    }
  }

  if (incomingVariants) {
    const incomingVariantIds = new Set<string>();
    const usedSkus = new Set(existingVariants.map((variant) => variant.sku));
    const normalizedIncomingVariants = incomingVariants.map((variant, index) => {
      const preferredSku = (variant.sku ?? "").trim() || `${product.sku}-${index + 1}`;
      const existingVariant = variant.id ? existingVariantMap.get(variant.id) : undefined;
      const baseSku = existingVariant?.sku ?? preferredSku;
      let finalSku = baseSku;
      let suffix = 1;

      while (finalSku !== existingVariant?.sku && usedSkus.has(finalSku)) {
        suffix += 1;
        finalSku = `${product.sku}-${index + 1}-${suffix}`;
      }

      usedSkus.add(finalSku);

      return {
        ...variant,
        sku: finalSku,
      };
    });

    await prisma.$transaction(async (tx) => {
      for (const [index, variant] of normalizedIncomingVariants.entries()) {
        const variantPayload = {
          name: variant.name ?? product.title,
          sku: variant.sku,
          options: (variant.options ?? {}) as any,
          price: variant.price ?? product.price,
          stock: variant.stock ?? product.stock,
        };

        if (variant.id && existingVariantMap.has(variant.id)) {
          incomingVariantIds.add(variant.id);

          await tx.productVariant.update({
            where: { id: variant.id },
            data: variantPayload,
          });

          continue;
        }

        const createdVariant = await tx.productVariant.create({
          data: {
            productId,
            ...variantPayload,
          },
        });

        incomingVariantIds.add(createdVariant.id);
      }

      const variantsToDelete = existingVariants.filter((variant) => !incomingVariantIds.has(variant.id));

      if (variantsToDelete.length > 0) {
        await tx.productVariant.deleteMany({
          where: {
            id: {
              in: variantsToDelete.map((variant) => variant.id),
            },
          },
        });
      }
    });
  }

  const updatedProduct = await prisma.product.update({
    where: {
      id: productId,
    },

    data: {
      ...productData,

      // Seller update requires approval again
      ...(role === "SELLER" && {
        status: "PENDING",
      }),
    },

    include: {
      shop: true,
      category: true,
      variants: true,
    },
  });

  if (role === "SELLER") {
    const admins = await prisma.user.findMany({
      where: { role: "ADMIN" },
      select: { id: true },
    });

    await Promise.all(
      admins.map(async (admin) => {
        const message = `${updatedProduct.title} from ${updatedProduct.shop.name} is waiting for moderation.`;
        const existing = await prisma.notification.findFirst({
          where: {
            userId: admin.id,
            type: "PRODUCT",
            title: "New product submitted for approval",
            message,
          },
        });

        if (!existing) {
          await createNotification({
            userId: admin.id,
            type: "PRODUCT",
            title: "New product submitted for approval",
            message,
            actionUrl: `/admin/products?status=PENDING`,
          });
        }
      })
    );
  }

  return updatedProduct;
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
    | "SUSPENDED",
  feedback?: string
) => {
  const product = await prisma.product.findUnique({
    where: {
      id: productId,
    },
  });

  if (!product) {
    throw new Error("Product not found");
  }

  const updatedProduct = await prisma.product.update({
    where: {
      id: productId,
    },

    data: {
      status,
      moderationFeedback: feedback?.trim() || null,
    },
  });

  const shop = await prisma.shop.findUnique({
    where: { id: updatedProduct.shopId },
    select: { sellerId: true, name: true },
  });

  if (shop && (status === "APPROVED" || status === "REJECTED" || feedback?.trim())) {
    await createNotification({
      userId: shop.sellerId,
      type: "PRODUCT",
      title: `Product ${status.toLowerCase()}`,
      message: feedback?.trim()
        ? `Your product "${updatedProduct.title}" from ${shop.name} was sent back for updates. Feedback: ${feedback.trim()}`
        : `Your product "${updatedProduct.title}" from ${shop.name} was ${status.toLowerCase()} by the admin team.`,
      actionUrl: `/seller/products/${updatedProduct.id}/edit`,
    });
  }

  return updatedProduct;
};

export const getSellerProducts = async (userId: string) => {
  await verifyActiveSeller(userId);

  return prisma.product.findMany({
    where: { shop: { sellerId: userId } },
    include: {
      shop: true,
      category: true,
      images: { orderBy: { sortOrder: "asc" } },
      variants: true,
    },
    orderBy: { createdAt: "desc" },
  });
};

export const getSellerProductById = async (productId: string, userId: string) => {
  await verifyActiveSeller(userId);

  const product = await prisma.product.findFirst({
    where: { id: productId, shop: { sellerId: userId } },
    include: {
      shop: true,
      category: true,
      images: { orderBy: { sortOrder: "asc" } },
      variants: true,
    },
  });

  if (!product) {
    throw new Error("Product not found");
  }

  return product;
};