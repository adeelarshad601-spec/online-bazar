import prisma from "../config/database.js";
import {
  CreateSellerPlanInput,
  UpdateSellerPlanInput,
  GetSellerPlansQuery,
  GetSellerSubscriptionsQuery,
} from "../validators/seller-plan.validator.js";
import { Decimal } from "@prisma/client/runtime/client";

// ==========================================
// SELLER PLAN SERVICES
// ==========================================

export const createSellerPlan = async (input: CreateSellerPlanInput) => {
  // Check if plan name already exists
  const existing = await prisma.sellerPlan.findUnique({
    where: { name: input.name },
  });

  if (existing) {
    throw new Error("Plan with this name already exists");
  }

  const plan = await prisma.sellerPlan.create({
    data: {
      name: input.name,
      description: input.description,
      price: new Decimal(input.price),
      maxProducts: input.maxProducts,
      commissionRate: new Decimal(input.commissionRate),
      isActive: input.isActive,
    },
  });

  return plan;
};

export const getSellerPlans = async (query: GetSellerPlansQuery) => {
  const page = query.page || 1;
  const limit = query.limit || 10;
  const skip = (page - 1) * limit;

  const where: any = {};
  if (query.isActive !== undefined) {
    where.isActive = query.isActive;
  }

  const [total, plans] = await Promise.all([
    prisma.sellerPlan.count({ where }),
    prisma.sellerPlan.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
  ]);

  return {
    plans,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getSellerPlanById = async (id: string) => {
  const plan = await prisma.sellerPlan.findUnique({
    where: { id },
  });

  if (!plan) {
    throw new Error("Seller plan not found");
  }

  return plan;
};

export const updateSellerPlan = async (id: string, input: UpdateSellerPlanInput) => {
  const plan = await prisma.sellerPlan.findUnique({ where: { id } });

  if (!plan) {
    throw new Error("Seller plan not found");
  }

  // Check if new name already exists (if name is being updated)
  if (input.name && input.name !== plan.name) {
    const duplicate = await prisma.sellerPlan.findUnique({
      where: { name: input.name },
    });
    if (duplicate) {
      throw new Error("Plan with this name already exists");
    }
  }

  const updated = await prisma.sellerPlan.update({
    where: { id },
    data: {
      name: input.name ?? undefined,
      description: input.description ?? undefined,
      price: input.price !== undefined ? new Decimal(input.price) : undefined,
      maxProducts: input.maxProducts ?? undefined,
      commissionRate: input.commissionRate !== undefined ? new Decimal(input.commissionRate) : undefined,
      isActive: input.isActive ?? undefined,
    },
  });

  return updated;
};

export const deleteSellerPlan = async (id: string) => {
  const plan = await prisma.sellerPlan.findUnique({ where: { id } });

  if (!plan) {
    throw new Error("Seller plan not found");
  }

  // Check if plan has active subscriptions
  const activeSubscriptions = await prisma.sellerSubscription.count({
    where: {
      planId: id,
      isActive: true,
    },
  });

  if (activeSubscriptions > 0) {
    throw new Error("Cannot delete plan with active subscriptions");
  }

  await prisma.sellerPlan.delete({
    where: { id },
  });

  return { message: "Plan deleted successfully" };
};

// Public available plans
export const getAvailableSellerPlans = async () => {
  const plans = await prisma.sellerPlan.findMany({
    where: {
      isActive: true,
    },
    orderBy: { price: "asc" },
  });

  return plans;
};

// ==========================================
// SELLER SUBSCRIPTION SERVICES
// ==========================================

export const createSellerSubscription = async (
  sellerId: string,
  planId: string,
  startedAt?: string
) => {
  // Verify seller exists and has seller role/status
  const seller = await prisma.user.findUnique({
    where: { id: sellerId },
    include: { shop: true },
  });

  if (!seller) {
    throw new Error("Seller not found");
  }

  if (seller.role !== "SELLER") {
    throw new Error("User is not a seller");
  }

  // Verify plan exists and is active
  const plan = await prisma.sellerPlan.findUnique({
    where: { id: planId },
  });

  if (!plan) {
    throw new Error("Seller plan not found");
  }

  if (!plan.isActive) {
    throw new Error("Selected plan is no longer available");
  }

  // Check for existing active subscription
  const existingSubscription = await prisma.sellerSubscription.findFirst({
    where: {
      sellerId,
      isActive: true,
      expiresAt: {
        gt: new Date(),
      },
    },
  });

  if (existingSubscription) {
    throw new Error("You already have an active subscription. Please cancel it first to subscribe to another plan.");
  }

  // Calculate dates
  const now = new Date();
  const start = startedAt ? new Date(startedAt) : now;
  
  // Set expiration to 30 days from start date
  const expiration = new Date(start);
  expiration.setDate(expiration.getDate() + 30);

  const subscription = await prisma.sellerSubscription.create({
    data: {
      sellerId,
      planId,
      startedAt: start,
      expiresAt: expiration,
      isActive: true,
    },
    include: {
      plan: true,
      seller: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  return subscription;
};

export const getCurrentSellerSubscription = async (sellerId: string) => {
  const subscription = await prisma.sellerSubscription.findFirst({
    where: {
      sellerId,
      isActive: true,
      expiresAt: {
        gt: new Date(),
      },
    },
    include: {
      plan: true,
      seller: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: { startedAt: "desc" },
  });

  return subscription;
};

export const getSellerSubscriptions = async (
  sellerId: string,
  query: GetSellerSubscriptionsQuery
) => {
  const page = query.page || 1;
  const limit = query.limit || 10;
  const skip = (page - 1) * limit;

  const where: any = {
    sellerId,
  };

  if (query.isActive !== undefined) {
    where.isActive = query.isActive;
  }

  const [total, subscriptions] = await Promise.all([
    prisma.sellerSubscription.count({ where }),
    prisma.sellerSubscription.findMany({
      where,
      include: {
        plan: true,
      },
      orderBy: { startedAt: "desc" },
      skip,
      take: limit,
    }),
  ]);

  return {
    subscriptions,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getSellerSubscriptionById = async (
  subscriptionId: string,
  sellerId?: string
) => {
  const subscription = await prisma.sellerSubscription.findUnique({
    where: { id: subscriptionId },
    include: {
      plan: true,
      seller: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  if (!subscription) {
    throw new Error("Subscription not found");
  }

  // If sellerId is provided, verify ownership
  if (sellerId && subscription.sellerId !== sellerId) {
    throw new Error("You do not have access to this subscription");
  }

  return subscription;
};

export const cancelSellerSubscription = async (
  subscriptionId: string,
  sellerId?: string
) => {
  const subscription = await prisma.sellerSubscription.findUnique({
    where: { id: subscriptionId },
  });

  if (!subscription) {
    throw new Error("Subscription not found");
  }

  // If sellerId is provided, verify ownership
  if (sellerId && subscription.sellerId !== sellerId) {
    throw new Error("You do not have access to this subscription");
  }

  const updated = await prisma.sellerSubscription.update({
    where: { id: subscriptionId },
    data: {
      isActive: false,
      expiresAt: new Date(), // Set expiration to now
    },
    include: {
      plan: true,
    },
  });

  return updated;
};

// Get all subscriptions (admin only)
export const getAllSellerSubscriptions = async (query: GetSellerSubscriptionsQuery) => {
  const page = query.page || 1;
  const limit = query.limit || 10;
  const skip = (page - 1) * limit;

  const where: any = {};

  if (query.isActive !== undefined) {
    where.isActive = query.isActive;
  }

  const [total, subscriptions] = await Promise.all([
    prisma.sellerSubscription.count({ where }),
    prisma.sellerSubscription.findMany({
      where,
      include: {
        plan: true,
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { startedAt: "desc" },
      skip,
      take: limit,
    }),
  ]);

  return {
    subscriptions,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};
