import prisma from "../config/database.js";
import { CreateReviewInput, UpdateReviewInput, PaginationQuery } from "../validators/review.validator.js";

export const createReview = async (userId: string, input: CreateReviewInput) => {
  const product = await prisma.product.findUnique({
    where: { id: input.productId },
  });

  if (!product) {
    throw new Error("Product not found");
  }

  if (product.status !== "APPROVED" || !product.isActive) {
    throw new Error("Product is not available for review");
  }

  const existingReview = await prisma.review.findUnique({
    where: {
      userId_productId: {
        userId,
        productId: input.productId,
      },
    },
  });

  if (existingReview) {
    throw new Error("Review already exists for this product");
  }

  const purchasedProduct = await prisma.vendorOrder.findFirst({
    where: {
      order: {
        userId,
        status: {
          not: "CANCELLED",
        },
      },
      items: {
        some: {
          productId: input.productId,
        },
      },
    },
  });

  if (!purchasedProduct) {
    throw new Error("You must purchase this product before reviewing it");
  }

  const review = await prisma.review.create({
    data: {
      rating: input.rating,
      comment: input.comment ?? null,
      userId,
      productId: input.productId,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  return review;
};

export const getProductReviews = async (productId: string, query: PaginationQuery) => {
  const page = query.page || 1;
  const limit = query.limit || 10;
  const skip = (page - 1) * limit;

  const product = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!product) {
    throw new Error("Product not found");
  }

  const [totalReviews, reviews, summary, distribution] = await Promise.all([
    prisma.review.count({ where: { productId } }),
    prisma.review.findMany({
      where: { productId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.review.aggregate({
      where: { productId },
      _avg: {
        rating: true,
      },
    }),
    prisma.review.groupBy({
      by: ["rating"],
      where: { productId },
      _count: {
        rating: true,
      },
    }),
  ]);

  const ratingDistribution = distribution.reduce<Record<number, number>>((acc, item) => {
    acc[item.rating] = item._count.rating;
    return acc;
  }, {});

  return {
    product: {
      id: product.id,
      title: product.title,
    },
    summary: {
      averageRating: summary._avg.rating ? Number(summary._avg.rating.toFixed(2)) : 0,
      totalReviews,
      distribution: {
        1: ratingDistribution[1] ?? 0,
        2: ratingDistribution[2] ?? 0,
        3: ratingDistribution[3] ?? 0,
        4: ratingDistribution[4] ?? 0,
        5: ratingDistribution[5] ?? 0,
      },
    },
    reviews,
    pagination: {
      page,
      limit,
      total: totalReviews,
      totalPages: Math.ceil(totalReviews / limit),
    },
  };
};

export const getReviewById = async (reviewId: string) => {
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
        },
      },
      product: {
        select: {
          id: true,
          title: true,
        },
      },
    },
  });

  if (!review) {
    throw new Error("Review not found");
  }

  return review;
};

export const updateReview = async (userId: string, reviewId: string, input: UpdateReviewInput) => {
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
  });

  if (!review) {
    throw new Error("Review not found");
  }

  if (review.userId !== userId) {
    throw new Error("Access denied");
  }

  const updated = await prisma.review.update({
    where: { id: reviewId },
    data: {
      ...(input.rating !== undefined ? { rating: input.rating } : {}),
      ...(input.comment !== undefined ? { comment: input.comment } : {}),
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
        },
      },
      product: {
        select: {
          id: true,
          title: true,
        },
      },
    },
  });

  return updated;
};

export const deleteReview = async (userId: string, role: string, reviewId: string) => {
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
  });

  if (!review) {
    throw new Error("Review not found");
  }

  if (role !== "ADMIN" && review.userId !== userId) {
    throw new Error("Access denied");
  }

  await prisma.review.delete({
    where: { id: reviewId },
  });

  return { id: reviewId };
};
