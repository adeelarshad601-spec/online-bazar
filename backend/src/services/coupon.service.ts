import prisma from "../config/database.js";
import {
  CreateCouponInput,
  UpdateCouponInput,
  ValidateCouponInput,
  PaginationQuery,
} from "../validators/coupon.validator.js";

export const createCoupon = async (input: CreateCouponInput) => {
  const code = input.code.toUpperCase();

  const existing = await prisma.coupon.findUnique({
    where: { code },
  });

  if (existing) {
    throw new Error("Coupon code already exists");
  }

  const coupon = await prisma.coupon.create({
    data: {
      code,
      type: input.type,
      value: input.value,
      minOrderAmount: input.minOrderAmount ?? null,
      maxDiscount: input.maxDiscount ?? null,
      usageLimit: input.usageLimit ?? null,
      expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
      isActive: input.isActive ?? true,
    },
  });

  return coupon;
};

export const getCoupons = async (query: PaginationQuery) => {
  const page = query.page || 1;
  const limit = query.limit || 10;
  const skip = (page - 1) * limit;

  const [total, coupons] = await Promise.all([
    prisma.coupon.count(),
    prisma.coupon.findMany({
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
  ]);

  return {
    coupons,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getCouponById = async (id: string) => {
  const coupon = await prisma.coupon.findUnique({
    where: { id },
  });

  if (!coupon) {
    throw new Error("Coupon not found");
  }

  return coupon;
};

export const updateCoupon = async (id: string, input: UpdateCouponInput) => {
  const coupon = await prisma.coupon.findUnique({ where: { id } });

  if (!coupon) {
    throw new Error("Coupon not found");
  }

  if (input.code) {
    input.code = input.code.toUpperCase();
    const duplicate = await prisma.coupon.findUnique({
      where: { code: input.code },
    });
    if (duplicate && duplicate.id !== id) {
      throw new Error("Coupon code already exists");
    }
  }

  const updated = await prisma.coupon.update({
    where: { id },
    data: {
      code: input.code ?? undefined,
      type: input.type ?? undefined,
      value: input.value ?? undefined,
      minOrderAmount: input.minOrderAmount ?? undefined,
      maxDiscount: input.maxDiscount ?? undefined,
      usageLimit: input.usageLimit ?? undefined,
      expiresAt: input.expiresAt ? new Date(input.expiresAt) : undefined,
      isActive: input.isActive ?? undefined,
    },
  });

  return updated;
};

export const deleteCoupon = async (id: string) => {
  const coupon = await prisma.coupon.findUnique({ where: { id } });

  if (!coupon) {
    throw new Error("Coupon not found");
  }

  await prisma.coupon.delete({ where: { id } });

  return { id };
};

export const validateCoupon = async (userId: string, input: ValidateCouponInput) => {
  const code = input.code.toUpperCase();
  const coupon = await prisma.coupon.findUnique({ where: { code } });

  if (!coupon) {
    throw new Error("Coupon not found");
  }

  if (!coupon.isActive) {
    throw new Error("Coupon is not active");
  }

  const now = new Date();
  if (coupon.expiresAt && coupon.expiresAt < now) {
    throw new Error("Coupon has expired");
  }

  if (coupon.usageLimit !== null && coupon.usageLimit !== undefined && coupon.usedCount >= coupon.usageLimit) {
    throw new Error("Coupon usage limit exceeded");
  }

  if (coupon.minOrderAmount !== null && coupon.minOrderAmount !== undefined && input.orderAmount < coupon.minOrderAmount) {
    throw new Error("Order amount does not meet minimum requirement");
  }

  let discountAmount = coupon.type === "PERCENTAGE"
    ? input.orderAmount * Number(coupon.value) / 100
    : Number(coupon.value);

  if (coupon.type === "PERCENTAGE" && coupon.maxDiscount !== null && coupon.maxDiscount !== undefined) {
    discountAmount = Math.min(discountAmount, Number(coupon.maxDiscount));
  }

  if (discountAmount > input.orderAmount) {
    discountAmount = input.orderAmount;
  }

  const finalAmount = input.orderAmount - discountAmount;

  return {
    coupon: {
      id: coupon.id,
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      minOrderAmount: coupon.minOrderAmount,
      maxDiscount: coupon.maxDiscount,
      expiresAt: coupon.expiresAt,
      isActive: coupon.isActive,
    },
    discountAmount,
    finalAmount,
  };
};
