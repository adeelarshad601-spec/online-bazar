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

const calculateSellerBalance = async (shopId: string, sellerId?: string) => {
  const commissionRate = sellerId ? await getSellerCommissionRate(sellerId) : new Decimal(10);
  const sellerShareRate = new Decimal(100).sub(commissionRate).div(new Decimal(100)); // e.g. 0.90 for 10% commission

  const deliveredVendorOrders = await prisma.vendorOrder.aggregate({
    where: {
      shopId,
      status: "DELIVERED",
      order: {
        paymentStatus: "COMPLETED",
        status: { not: "CANCELLED" },
      },
    },
    _sum: {
      subTotal: true,
    },
  });

  const requestedPayouts = await prisma.sellerPayout.aggregate({
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

  const deliveredSubTotal = deliveredVendorOrders._sum.subTotal ?? new Decimal(0);
  const deliveredNetEarnings = deliveredSubTotal.mul(sellerShareRate);
  const totalPaidOrRequested = requestedPayouts._sum.payoutAmount ?? new Decimal(0);

  const balance = deliveredNetEarnings.sub(totalPaidOrRequested);
  return balance.lt(new Decimal(0)) ? new Decimal(0) : balance;
};

export const getSellerPayoutDashboard = async (sellerId: string) => {
  const shop = await prisma.shop.findUnique({ where: { sellerId } });
  if (!shop) throw new Error("Seller shop not found");

  const commissionRate = await getSellerCommissionRate(sellerId);
  const sellerShareRate = new Decimal(100).sub(commissionRate).div(new Decimal(100)); // e.g. 0.90

  // Do not auto-rewrite payment status here. The persisted payment state is the source of truth.
  // A failed or unpaid order must never be promoted to COMPLETED by the payout dashboard.

  // All successful paid orders for this shop
  const allPaidOrders = await prisma.vendorOrder.aggregate({
    where: {
      shopId: shop.id,
      order: {
        paymentStatus: "COMPLETED",
        status: { not: "CANCELLED" },
      },
    },
    _sum: { subTotal: true },
  });

  // Pending delivery paid orders for this shop
  const pendingDeliveryOrders = await prisma.vendorOrder.aggregate({
    where: {
      shopId: shop.id,
      status: { not: "DELIVERED" },
      order: {
        paymentStatus: "COMPLETED",
        status: { not: "CANCELLED" },
      },
    },
    _sum: { subTotal: true },
  });

  // Delivered paid orders for this shop
  const deliveredOrders = await prisma.vendorOrder.aggregate({
    where: {
      shopId: shop.id,
      status: "DELIVERED",
      order: {
        paymentStatus: "COMPLETED",
        status: { not: "CANCELLED" },
      },
    },
    _sum: { subTotal: true },
  });

  // Payout aggregations
  const completedPayoutsAggregate = await prisma.sellerPayout.aggregate({
    where: {
      shopId: shop.id,
      status: "COMPLETED",
    },
    _sum: { payoutAmount: true },
  });

  const totalRequestedPayoutsAggregate = await prisma.sellerPayout.aggregate({
    where: {
      shopId: shop.id,
      status: { in: ["PENDING", "PROCESSING", "COMPLETED"] },
    },
    _sum: { payoutAmount: true },
  });

  const grossSales = allPaidOrders._sum.subTotal ?? new Decimal(0);
  const totalEarnings = grossSales.mul(sellerShareRate);

  const pendingSales = pendingDeliveryOrders._sum.subTotal ?? new Decimal(0);
  const pendingEarnings = pendingSales.mul(sellerShareRate);

  const deliveredSales = deliveredOrders._sum.subTotal ?? new Decimal(0);
  const deliveredEarnings = deliveredSales.mul(sellerShareRate);

  const paidOutAmount = completedPayoutsAggregate._sum.payoutAmount ?? new Decimal(0);
  const totalRequestedPayouts = totalRequestedPayoutsAggregate._sum.payoutAmount ?? new Decimal(0);

  const availableBalanceCalc = deliveredEarnings.sub(totalRequestedPayouts);
  const availableBalance = availableBalanceCalc.lt(new Decimal(0)) ? new Decimal(0) : availableBalanceCalc;

  const payoutCount = await prisma.sellerPayout.count({ where: { shopId: shop.id } });

  return {
    shopId: shop.id,
    shopName: shop.name,
    grossSales,
    totalEarnings,
    pendingEarnings,
    availableBalance,
    balance: availableBalance,
    paidOutAmount,
    payoutRequests: payoutCount,
    commissionRate: commissionRate.toNumber(),
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

  const requestAmount = new Decimal(input.amount);
  if (requestAmount.lte(new Decimal(0))) {
    throw new Error("Payout amount must be greater than 0");
  }

  const commissionRate = await getSellerCommissionRate(sellerId);
  const sellerShareRate = new Decimal(100).sub(commissionRate).div(new Decimal(100)); // e.g. 0.90

  // Atomic transaction for balance verification & request creation
  const payout = await prisma.$transaction(async (tx) => {
    const deliveredVendorOrders = await tx.vendorOrder.aggregate({
      where: {
        shopId: shop.id,
        status: "DELIVERED",
        order: {
          paymentStatus: "COMPLETED",
          status: { not: "CANCELLED" },
        },
      },
      _sum: { subTotal: true },
    });

    const requestedPayouts = await tx.sellerPayout.aggregate({
      where: {
        shopId: shop.id,
        status: { in: ["PENDING", "PROCESSING", "COMPLETED"] },
      },
      _sum: { payoutAmount: true },
    });

    const deliveredSubTotal = deliveredVendorOrders._sum.subTotal ?? new Decimal(0);
    const deliveredNetEarnings = deliveredSubTotal.mul(sellerShareRate);
    const totalPaidOrRequested = requestedPayouts._sum.payoutAmount ?? new Decimal(0);

    const currentAvailableBalance = deliveredNetEarnings.sub(totalPaidOrRequested);

    if (requestAmount.gt(currentAvailableBalance)) {
      throw new Error("Requested payout exceeds available balance");
    }

    return tx.sellerPayout.create({
      data: {
        shopId: shop.id,
        amount: requestAmount,
        commission: new Decimal(0),
        payoutAmount: requestAmount,
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
