import prisma from "../config/database.js";
import { Decimal } from "@prisma/client/runtime/client";

export const getAdminStats = async () => {
  // Use Promise.all to fetch all stats in parallel for optimal performance
  const [
    totalUsers,
    totalCustomers,
    totalSellers,
    totalAdmins,
    pendingSellers,
    totalProducts,
    approvedProducts,
    pendingProducts,
    totalOrders,
    completedOrders,
    processingOrders,
    pendingOrders,
    cancelledOrders,
    pendingPayouts,
    completedPayouts,
    totalSalesData,
  ] = await Promise.all([
    // Total users count
    prisma.user.count(),

    // Total customers (users with CUSTOMER role)
    prisma.user.count({
      where: {
        role: "CUSTOMER",
      },
    }),

    // Total sellers (users with SELLER role)
    prisma.user.count({
      where: {
        role: "SELLER",
      },
    }),

    // Total admins (users with ADMIN role)
    prisma.user.count({
      where: {
        role: "ADMIN",
      },
    }),

    // Pending sellers (awaiting KYC / approval)
    prisma.user.count({
      where: {
        sellerStatus: "PENDING",
      },
    }),

    // Total products
    prisma.product.count(),

    // Approved active products
    prisma.product.count({
      where: {
        status: "APPROVED",
      },
    }),

    // Products pending admin review
    prisma.product.count({
      where: {
        status: "PENDING",
      },
    }),

    // Total orders
    prisma.order.count(),

    // Completed / Delivered orders
    prisma.order.count({
      where: {
        status: "DELIVERED",
      },
    }),

    // Processing orders
    prisma.order.count({
      where: {
        status: "PROCESSING",
      },
    }),

    // Pending orders
    prisma.order.count({
      where: {
        status: "PENDING",
      },
    }),

    // Cancelled orders
    prisma.order.count({
      where: {
        status: "CANCELLED",
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

    // Total sales (sum of order amounts)
    prisma.order.aggregate({
      _sum: {
        totalAmount: true,
      },
    }),
  ]);

  const totalSales = totalSalesData._sum.totalAmount ?? new Decimal(0);

  return {
    users: {
      total: totalUsers,
      customers: totalCustomers,
      sellers: totalSellers,
      admins: totalAdmins,
      pendingSellers,
    },
    products: {
      total: totalProducts,
      approved: approvedProducts,
      pending: pendingProducts,
    },
    orders: {
      total: totalOrders,
      completed: completedOrders,
      processing: processingOrders,
      pending: pendingOrders,
      cancelled: cancelledOrders,
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

