import { Decimal } from "@prisma/client/runtime/client";
import prisma from "../config/database.js";
import {
  AdminOrdersQuery,
  PaginationQuery,
  StatusUpdateInput,
  VendorOrdersQuery,
  VendorOrderStatusUpdateInput,
} from "../validators/order.validator.js";
import { createNotification } from "./notification.service.js";

const mapOrder = (order: any) => ({
  id: order.id,
  orderNumber: order.orderNumber,
  totalAmount: order.totalAmount,
  paymentStatus: order.paymentStatus,
  status: order.status,
  shippingAddress: order.shippingAddress,
  createdAt: order.createdAt,
  updatedAt: order.updatedAt,
  vendorOrders: order.vendorOrders.map((vendorOrder: any) => ({
    id: vendorOrder.id,
    shop: vendorOrder.shop,
    status: vendorOrder.status,
    subTotal: vendorOrder.subTotal,
    createdAt: vendorOrder.createdAt,
    updatedAt: vendorOrder.updatedAt,
    items: vendorOrder.items.map((item: any) => ({
      id: item.id,
      product: item.product,
      variant: item.variant,
      price: item.price,
      quantity: item.quantity,
      createdAt: item.createdAt,
    })),
  })),
  payment: order.payment,
  coupon: order.coupon,
});

export const getCustomerOrders = async (
  userId: string,
  query: PaginationQuery
) => {
  const page = query.page || 1;
  const limit = query.limit || 10;
  const skip = (page - 1) * limit;

  const [total, orders] = await Promise.all([
    prisma.order.count({ where: { userId } }),
    prisma.order.findMany({
      where: { userId },
      include: {
        vendorOrders: {
          include: {
            shop: true,
            items: {
              include: {
                product: true,
                variant: true,
              },
            },
          },
        },
        payment: true,
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
  ]);

  return {
    orders: orders.map(mapOrder),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getCustomerOrder = async (userId: string, orderId: string) => {
  const order = await prisma.order.findFirst({
    where: { id: orderId, userId },
    include: {
      vendorOrders: {
        include: {
          shop: true,
          items: {
            include: {
              product: true,
              variant: true,
            },
          },
        },
      },
      payment: true,
    },
  });

  if (!order) {
    throw new Error("Order not found");
  }

  return mapOrder(order);
};

export const cancelCustomerOrder = async (userId: string, orderId: string) => {
  const order = await prisma.order.findFirst({
    where: { id: orderId, userId },
    include: {
      payment: true,
      vendorOrders: {
        include: {
          items: {
            include: {
              product: true,
              variant: true,
            },
          },
        },
      },
    },
  });

  if (!order) {
    throw new Error("Order not found");
  }

  if (order.status !== "PENDING") {
    throw new Error("Order cannot be cancelled at this stage");
  }

  return await prisma.$transaction(async (tx) => {
    await Promise.all(
      order.vendorOrders.map((vendorOrder: any) =>
        tx.vendorOrder.update({
          where: { id: vendorOrder.id },
          data: { status: "CANCELLED" },
        })
      )
    );

    await Promise.all(
      order.vendorOrders.flatMap((vendorOrder: any) =>
        vendorOrder.items.map((item: any) => {
          if (item.variant) {
            return tx.productVariant.update({
              where: { id: item.variant.id },
              data: {
                stock: item.variant.stock + item.quantity,
              },
            });
          }
          return tx.product.update({
            where: { id: item.product.id },
            data: {
              stock: item.product.stock + item.quantity,
            },
          });
        })
      )
    );

    await tx.payment.update({
      where: { orderId: order.id },
      data: {
        status: order.payment?.status === "PENDING" ? "FAILED" : order.payment?.status,
      },
    });

    const cancelledOrder = await tx.order.update({
      where: { id: order.id },
      data: { status: "CANCELLED" },
      include: {
        vendorOrders: {
          include: {
            shop: true,
            items: {
              include: {
                product: true,
                variant: true,
              },
            },
          },
        },
        payment: true,
      },
    });

    // create history records for vendor orders and order
    try {
      await Promise.all(
        cancelledOrder.vendorOrders.map((vo: any) =>
          tx.orderStatusHistory.create({
            data: {
              orderId: cancelledOrder.id,
              vendorOrderId: vo.id,
              previousStatus: "PENDING",
              newStatus: "CANCELLED",
              changedById: userId,
            },
          })
        )
      );

      await tx.orderStatusHistory.create({
        data: {
          orderId: cancelledOrder.id,
          previousStatus: "PENDING",
          newStatus: "CANCELLED",
          changedById: userId,
        },
      });
    } catch (err) {
      console.error("Failed to create order status history on cancel", err);
    }

    return mapOrder(cancelledOrder);
  });
};

export const getSellerVendorOrders = async (
  sellerId: string,
  query: VendorOrdersQuery
) => {
  const shop = await prisma.shop.findUnique({
    where: { sellerId },
  });

  if (!shop) {
    throw new Error("Seller shop not found");
  }

  const vendorOrders = await prisma.vendorOrder.findMany({
    where: {
      shopId: shop.id,
      ...(query.status ? { status: query.status } : {}),
    },
    include: {
      order: true,
      items: {
        include: {
          product: true,
          variant: true,
        },
      },
      shop: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return vendorOrders.map((vendorOrder) => ({
    id: vendorOrder.id,
    order: {
      id: vendorOrder.order.id,
      orderNumber: vendorOrder.order.orderNumber,
      totalAmount: vendorOrder.order.totalAmount,
      status: vendorOrder.order.status,
      paymentStatus: vendorOrder.order.paymentStatus,
      shippingAddress: vendorOrder.order.shippingAddress,
      createdAt: vendorOrder.order.createdAt,
      updatedAt: vendorOrder.order.updatedAt,
    },
    shop: vendorOrder.shop,
    status: vendorOrder.status,
    subTotal: vendorOrder.subTotal,
    items: vendorOrder.items.map((item) => ({
      id: item.id,
      product: item.product,
      variant: item.variant,
      price: item.price,
      quantity: item.quantity,
      createdAt: item.createdAt,
    })),
    createdAt: vendorOrder.createdAt,
    updatedAt: vendorOrder.updatedAt,
  }));
};

export const updateVendorOrderStatus = async (
  sellerId: string,
  vendorOrderId: string,
  input: VendorOrderStatusUpdateInput
) => {
  const vendorOrder = await prisma.vendorOrder.findUnique({
    where: { id: vendorOrderId },
    include: {
      shop: true,
    },
  });

  if (!vendorOrder) {
    throw new Error("Vendor order not found");
  }

  if (vendorOrder.shop.sellerId !== sellerId) {
    throw new Error("Access denied");
  }

  const updated = await prisma.vendorOrder.update({
    where: { id: vendorOrderId },
    data: { status: input.status },
    include: {
      shop: true,
      order: true,
      items: {
        include: {
          product: true,
          variant: true,
        },
      },
    },
  });

  // Sync parent Order status and Payment status when seller updates VendorOrder status
  try {
    const allVendorOrders = await prisma.vendorOrder.findMany({
      where: { orderId: updated.orderId },
    });

    const isAllDelivered = allVendorOrders.every((vo) => vo.status === "DELIVERED");
    const isAnyShipped = allVendorOrders.some((vo) => vo.status === "SHIPPED");
    const isAnyProcessing = allVendorOrders.some((vo) => vo.status === "PROCESSING");

    let newOrderStatus: any = updated.order.status;
    if (isAllDelivered || input.status === "DELIVERED") {
      newOrderStatus = "DELIVERED";
    } else if (isAnyShipped || input.status === "SHIPPED") {
      newOrderStatus = "SHIPPED";
    } else if (isAnyProcessing || input.status === "PROCESSING") {
      newOrderStatus = "PROCESSING";
    }

    const isDelivered = newOrderStatus === "DELIVERED" || input.status === "DELIVERED";

    await prisma.order.update({
      where: { id: updated.orderId },
      data: {
        status: newOrderStatus,
        paymentStatus: isDelivered ? "COMPLETED" : updated.order.paymentStatus,
      },
    });

    if (isDelivered) {
      await prisma.payment.updateMany({
        where: { orderId: updated.orderId },
        data: {
          status: "COMPLETED",
          paidAt: new Date(),
        },
      });
    }
  } catch (err) {
    console.error("Failed to sync parent order status", err);
  }

  // create order status history for vendor order
  try {
    await prisma.orderStatusHistory.create({
      data: {
        orderId: updated.orderId,
        vendorOrderId: updated.id,
        previousStatus: vendorOrder.status as any,
        newStatus: updated.status as any,
        changedById: sellerId,
      },
    });
  } catch (err) {
    console.error("Failed to create vendor order status history", err);
  }

  // notify customer about vendor order status change
  try {
    await createNotification({
      userId: updated.order.userId,
      type: "ORDER",
      title: `Order ${updated.order.orderNumber} update`,
      message: `Items from shop ${updated.shop.name} are now ${updated.status}`,
    });
  } catch (err) {
    console.error("Failed to create notification for vendor order status change", err);
  }


  return {
    id: updated.id,
    shop: updated.shop,
    status: updated.status,
    subTotal: updated.subTotal,
    order: {
      id: updated.order.id,
      orderNumber: updated.order.orderNumber,
      totalAmount: updated.order.totalAmount,
      paymentStatus: updated.order.paymentStatus,
      status: updated.order.status,
      shippingAddress: updated.order.shippingAddress,
      createdAt: updated.order.createdAt,
      updatedAt: updated.order.updatedAt,
    },
    items: updated.items,
    createdAt: updated.createdAt,
    updatedAt: updated.updatedAt,
  };
};

export const getAdminOrders = async (query: AdminOrdersQuery) => {
  const page = query.page || 1;
  const limit = query.limit || 10;
  const skip = (page - 1) * limit;

  const where: any = {};
  if (query.status) {
    where.status = query.status;
  }
  if (query.paymentStatus) {
    where.paymentStatus = query.paymentStatus;
  }

  const [total, orders] = await Promise.all([
    prisma.order.count({ where }),
    prisma.order.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            isVerified: true,
            avatar: true,
          },
        },
        vendorOrders: {
          include: {
            shop: true,
            items: {
              include: {
                product: true,
                variant: true,
              },
            },
          },
        },
        payment: true,
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
  ]);

  return {
    orders: orders.map((order) => ({
      ...mapOrder(order),
      user: order.user,
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const updateAdminOrderStatus = async (
  orderId: string,
  input: StatusUpdateInput
) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
  });

  if (!order) {
    throw new Error("Order not found");
  }

  const updated = await prisma.order.update({
    where: { id: orderId },
    data: { status: input.status },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isVerified: true,
          avatar: true,
        },
      },
      vendorOrders: {
        include: {
          shop: true,
          items: {
            include: {
              product: true,
              variant: true,
            },
          },
        },
      },
      payment: true,
    },
  });

  // create order status history
  try {
    await prisma.orderStatusHistory.create({
      data: {
        orderId: updated.id,
        previousStatus: order.status as any,
        newStatus: updated.status as any,
      },
    });
  } catch (err) {
    console.error("Failed to create order status history", err);
  }

  // notify customer about order status change
  try {
    await createNotification({
      userId: updated.user.id,
      type: "ORDER",
      title: `Order ${updated.orderNumber} status updated`,
      message: `Order status changed to ${updated.status}`,
    });
  } catch (err) {
    console.error("Failed to create notification for order status change", err);
  }

  return {
    ...mapOrder(updated),
    user: updated.user,
  };
};
