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
    pendingPayoutsAmountData,
    completedPayoutsAmountData,
    completedVendorOrders,
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

    // Pending payouts count
    prisma.sellerPayout.count({
      where: {
        status: { in: ["PENDING", "PROCESSING"] },
      },
    }),

    // Completed payouts count
    prisma.sellerPayout.count({
      where: {
        status: "COMPLETED",
      },
    }),

    // Total sales (sum of order amounts for COMPLETED payment status)
    prisma.order.aggregate({
      where: {
        paymentStatus: "COMPLETED",
        status: { not: "CANCELLED" },
      },
      _sum: {
        totalAmount: true,
      },
    }),

    // Pending payouts amount
    prisma.sellerPayout.aggregate({
      where: {
        status: { in: ["PENDING", "PROCESSING"] },
      },
      _sum: {
        payoutAmount: true,
      },
    }),

    // Completed payouts amount
    prisma.sellerPayout.aggregate({
      where: {
        status: "COMPLETED",
      },
      _sum: {
        payoutAmount: true,
      },
    }),

    // Completed vendor orders with active seller plan commission rates
    prisma.vendorOrder.findMany({
      where: {
        order: {
          paymentStatus: "COMPLETED",
          status: { not: "CANCELLED" },
        },
      },
      select: {
        subTotal: true,
        shop: {
          select: {
            sellerId: true,
            seller: {
              select: {
                sellerSubscriptions: {
                  where: {
                    isActive: true,
                    expiresAt: { gt: new Date() },
                  },
                  include: { plan: true },
                  take: 1,
                  orderBy: { startedAt: "desc" },
                },
              },
            },
          },
        },
      },
    }),
  ]);

  const totalSales = totalSalesData._sum.totalAmount ?? new Decimal(0);

  let platformCommission = new Decimal(0);
  let sellerEarnings = new Decimal(0);

  if (completedVendorOrders.length > 0) {
    for (const vo of completedVendorOrders) {
      const activeSub = vo.shop?.seller?.sellerSubscriptions?.[0];
      const rate = activeSub?.plan?.commissionRate ?? new Decimal(10);
      const comm = vo.subTotal.mul(rate).div(new Decimal(100));
      const sellerEarn = vo.subTotal.sub(comm);

      platformCommission = platformCommission.add(comm);
      sellerEarnings = sellerEarnings.add(sellerEarn);
    }
  } else {
    platformCommission = totalSales.mul(new Decimal("0.10"));
    sellerEarnings = totalSales.sub(platformCommission);
  }

  const pendingPayoutsAmount = pendingPayoutsAmountData._sum.payoutAmount ?? new Decimal(0);
  const completedPayoutsAmount = completedPayoutsAmountData._sum.payoutAmount ?? new Decimal(0);

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
      pendingAmount: pendingPayoutsAmount,
      completedAmount: completedPayoutsAmount,
    },
    sales: {
      total: totalSales,
      gmv: totalSales,
      platformCommission,
      sellerEarnings,
    },
  };
};


