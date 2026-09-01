import prisma from "../config/database.js";
import { ProductSearchQuery } from "../validators/search.validator.js";

export const searchProducts = async (query: ProductSearchQuery) => {
  const page = query.page || 1;
  const limit = query.limit || 10;
  const skip = (page - 1) * limit;

  const where: any = {
    status: "APPROVED",
    isActive: true,
  };

  if (query.q) {
    const q = query.q.trim();
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
      { sku: { contains: q, mode: "insensitive" } },
    ];
  }

  if (query.categoryId) where.categoryId = query.categoryId;
  if (query.shopId) where.shopId = query.shopId;
  if (query.minPrice) where.price = { gte: query.minPrice };
  if (query.maxPrice) where.price = { ...(where.price || {}), lte: query.maxPrice };

  const orderBy: any = {};
  if (query.sort) {
    if (query.sort === "price_asc") orderBy.price = "asc";
    else if (query.sort === "price_desc") orderBy.price = "desc";
    else if (query.sort === "newest") orderBy.createdAt = "desc";
  } else {
    orderBy.createdAt = "desc";
  }

  const [total, productsRaw] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      include: {
        images: true,
        shop: true,
        category: true,
        reviews: {
          select: { rating: true },
        },
      },
      orderBy,
      skip,
      take: limit,
    }),
  ]);

  const products = productsRaw.map((product) => {
    const { reviews, ...rest } = product;
    const reviewCount = reviews ? reviews.length : 0;
    const avgRating =
      reviewCount > 0
        ? Number((reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviewCount).toFixed(1))
        : 0;

    return {
      ...rest,
      rating: avgRating,
      reviewCount,
    };
  });

  return {
    products,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const searchSuggestions = async (q: string, limit = 5) => {
  const qtrim = q.trim();
  const products = await prisma.product.findMany({
    where: {
      status: "APPROVED",
      isActive: true,
      OR: [
        { title: { contains: qtrim, mode: "insensitive" } },
        { sku: { contains: qtrim, mode: "insensitive" } },
      ],
    },
    select: { id: true, title: true, slug: true },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return products;
};
