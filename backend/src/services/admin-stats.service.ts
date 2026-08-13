import prisma from "../config/database.js";
import { Decimal } from "@prisma/client/runtime/client";

export const getAdminStats = async () => {
  // Use Promise.all to fetch all stats in parallel for better performance
  const [
    totalUsers,
    totalSellers,
    totalProducts,
    totalOrders,
    pendingSellers,
    pendingPayouts,
    completedPayouts,
    totalSalesData,
  ] = await Promise.all([
    // Total users count
    prisma.user.count(),

    // Total sellers (users with SELLER role)
    prisma.user.count({
      where: {
        role: "SELLER",
      },
    }),

    // Total products
    prisma.product.count(),

    // Total orders
    prisma.order.count(),

    // Pending sellers (awaiting approval)
    prisma.user.count({
      where: {
        role: "SELLER",
        sellerStatus: "PENDING",
      },
    }),

    // Pending payouts
    prisma.sellerPayout.count({
      where: {
        status: "PENDING",
      },
    }),

    // Completed payouts
    prisma.sellerPayout.count({
      where: {
        status: "COMPLETED",
      },
    }),

    // Total sales (sum of completed order amounts)
    prisma.order.aggregate({
      where: {
        paymentStatus: "COMPLETED",
      },
      _sum: {
        totalAmount: true,
      },
    }),
  ]);

  const totalSales = totalSalesData._sum.totalAmount ?? new Decimal(0);

  return {
    users: {
      total: totalUsers,
      sellers: totalSellers,
      pendingSellers,
    },
    products: {
      total: totalProducts,
    },
    orders: {
      total: totalOrders,
    },
    payouts: {
      pending: pendingPayouts,
      completed: completedPayouts,
    },
    sales: {
      total: totalSales,
    },
  };
};
