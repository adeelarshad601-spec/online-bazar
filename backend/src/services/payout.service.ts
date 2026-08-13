import { Decimal } from "@prisma/client/runtime/client";
import prisma from "../config/database.js";
import { PayoutRequestInput, PayoutQuery, PayoutStatusUpdateInput } from "../validators/payout.validator.js";

// Get the seller's active subscription commission rate or use default
const getSellerCommissionRate = async (sellerId: string): Promise<Decimal> => {
  const activeSubscription = await prisma.sellerSubscription.findFirst({
    where: {
      sellerId,
      isActive: true,
      expiresAt: {
        gt: new Date(),
      },
    },
    include: {
      plan: true,
    },
    orderBy: {
      startedAt: "desc",
    },
  });

  if (activeSubscription && activeSubscription.plan) {
    return activeSubscription.plan.commissionRate;
  }

  // Default commission rate if no active subscription
  return new Decimal(10); // 10% default
};

const calculateSellerBalance = async (shopId: string) => {
  const vendorOrderTotals = await prisma.vendorOrder.aggregate({
    where: {
      shopId,
      status: {
        in: ["PROCESSING", "SHIPPED", "DELIVERED"],
      },
      order: {
        paymentStatus: "COMPLETED",
      },
    },
    _sum: {
      subTotal: true,
    },
  });

  const completedPayouts = await prisma.sellerPayout.aggregate({
    where: {
      shopId,
      status: {
        in: ["PENDING", "PROCESSING", "COMPLETED"],
      },
    },
    _sum: {
      payoutAmount: true,
    },
  });

  const totalPaid = completedPayouts._sum.payoutAmount ?? new Decimal(0);
  const totalRevenue = vendorOrderTotals._sum.subTotal ?? new Decimal(0);

  return totalRevenue.sub(totalPaid);
};

export const getSellerPayoutDashboard = async (sellerId: string) => {
  const shop = await prisma.shop.findUnique({ where: { sellerId } });
  if (!shop) throw new Error("Seller shop not found");

  const balance = await calculateSellerBalance(shop.id);

  const totalEarnings = await prisma.vendorOrder.aggregate({
    where: {
      shopId: shop.id,
      status: {
        in: ["PROCESSING", "SHIPPED", "DELIVERED"],
      },
      order: {
        paymentStatus: "COMPLETED",
      },
    },
    _sum: { subTotal: true },
  });

  const payoutCount = await prisma.sellerPayout.count({ where: { shopId: shop.id } });

  return {
    shopId: shop.id,
    shopName: shop.name,
    totalEarnings: totalEarnings._sum.subTotal ?? new Decimal(0),
    balance,
    payoutRequests: payoutCount,
  };
};

export const getSellerPayouts = async (sellerId: string, query: PayoutQuery) => {
  const shop = await prisma.shop.findUnique({ where: { sellerId } });
  if (!shop) throw new Error("Seller shop not found");

  const page = query.page;
  const limit = query.limit;
  const skip = (page - 1) * limit;

  const where: any = { shopId: shop.id };
  if (query.status) where.status = query.status;

  const [total, payouts] = await Promise.all([
    prisma.sellerPayout.count({ where }),
    prisma.sellerPayout.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
  ]);

  return {
    payouts,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};

export const getSellerPayoutById = async (sellerId: string, payoutId: string) => {
  const shop = await prisma.shop.findUnique({ where: { sellerId } });
  if (!shop) throw new Error("Seller shop not found");

  const payout = await prisma.sellerPayout.findUnique({ where: { id: payoutId } });
  if (!payout) throw new Error("Payout not found");
  if (payout.shopId !== shop.id) throw new Error("Access denied");

  return payout;
};

export const requestSellerPayout = async (sellerId: string, input: PayoutRequestInput) => {
  const shop = await prisma.shop.findUnique({ where: { sellerId } });
  if (!shop) throw new Error("Seller shop not found");

  // Get the seller's commission rate from active subscription
  const commissionRate = await getSellerCommissionRate(sellerId);

  // Use a transaction to ensure atomicity of balance check and payout creation
  // This prevents race conditions where two concurrent requests could exceed available balance
  const payout = await prisma.$transaction(async (tx) => {
    // Get current balance within the transaction
    const vendorOrderTotals = await tx.vendorOrder.aggregate({
      where: {
        shopId: shop.id,
        status: {
          in: ["PROCESSING", "SHIPPED", "DELIVERED"],
        },
        order: {
          paymentStatus: "COMPLETED",
        },
      },
      _sum: {
        subTotal: true,
      },
    });

    const completedPayouts = await tx.sellerPayout.aggregate({
      where: {
        shopId: shop.id,
        status: {
          in: ["PENDING", "PROCESSING", "COMPLETED"],
        },
      },
      _sum: {
        payoutAmount: true,
      },
    });

    const totalPaid = completedPayouts._sum.payoutAmount ?? new Decimal(0);
    const totalRevenue = vendorOrderTotals._sum.subTotal ?? new Decimal(0);
    const currentBalance = totalRevenue.sub(totalPaid);

    // Verify balance within transaction (prevents race condition)
    if (new Decimal(input.amount).gt(currentBalance)) {
      throw new Error("Requested payout exceeds available balance");
    }

    // Calculate commission and payout amount using the seller's commission rate
    const commission = new Decimal(input.amount).mul(commissionRate).div(new Decimal(100));
    const payoutAmount = new Decimal(input.amount).sub(commission);

    // Create payout within the transaction
    return tx.sellerPayout.create({
      data: {
        shopId: shop.id,
        amount: new Decimal(input.amount),
        commission,
        payoutAmount,
        status: "PENDING",
      },
    });
  });

  return payout;
};

export const getAdminPayouts = async (query: PayoutQuery) => {
  const page = query.page;
  const limit = query.limit;
  const skip = (page - 1) * limit;

  const where: any = {};
  if (query.status) where.status = query.status;

  const [total, payouts] = await Promise.all([
    prisma.sellerPayout.count({ where }),
    prisma.sellerPayout.findMany({
      where,
      include: { shop: { include: { seller: true } } },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
  ]);

  return {
    payouts,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};

export const getAdminPayoutById = async (payoutId: string) => {
  const payout = await prisma.sellerPayout.findUnique({
    where: { id: payoutId },
    include: { shop: { include: { seller: true } } },
  });
  if (!payout) throw new Error("Payout not found");
  return payout;
};

export const updatePayoutStatus = async (payoutId: string, input: PayoutStatusUpdateInput) => {
  const payout = await prisma.sellerPayout.findUnique({ where: { id: payoutId } });
  if (!payout) throw new Error("Payout not found");

  if (payout.status === "COMPLETED") {
    throw new Error("Completed payouts cannot be updated");
  }

  if (input.status === "PENDING" && payout.status !== "PENDING") {
    throw new Error("Only pending payouts can be moved back to pending");
  }

  return prisma.sellerPayout.update({
    where: { id: payoutId },
    data: {
      status: input.status,
      paidAt: input.status === "COMPLETED" ? new Date() : payout.paidAt,
    },
  });
};
