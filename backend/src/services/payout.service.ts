import { Decimal } from "@prisma/client/runtime/client";
import prisma from "../config/database.js";
import { PayoutRequestInput, PayoutQuery, PayoutStatusUpdateInput } from "../validators/payout.validator.js";

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

  const balance = await calculateSellerBalance(shop.id);
  if (new Decimal(input.amount).gt(balance)) {
    throw new Error("Requested payout exceeds available balance");
  }

  const commissionRate = new Decimal(0.10);
  const commission = new Decimal(input.amount).mul(commissionRate);
  const payoutAmount = new Decimal(input.amount).sub(commission);

  return prisma.sellerPayout.create({
    data: {
      shopId: shop.id,
      amount: new Decimal(input.amount),
      commission,
      payoutAmount,
      status: "PENDING",
    },
  });
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
