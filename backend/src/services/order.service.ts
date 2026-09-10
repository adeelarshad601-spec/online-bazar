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

const FULFILLMENT_STATUSES = new Set(["PROCESSING", "SHIPPED", "DELIVERED"]);

const assertValidOrderStatusTransition = (currentStatus: string, nextStatus: string) => {
  if (nextStatus === currentStatus) {
    return;
  }

  const allowedTransitions: Record<string, string[]> = {
    PENDING: ["PROCESSING", "CANCELLED"],
    PROCESSING: ["SHIPPED", "CANCELLED"],
    SHIPPED: ["DELIVERED", "CANCELLED"],
    DELIVERED: [],
    CANCELLED: [],
  };

  if (currentStatus === "CANCELLED") {
    throw new Error(`Invalid order status transition from ${currentStatus} to ${nextStatus}.`);
  }

  if (nextStatus === "CANCELLED") {
    if (["PENDING", "PROCESSING", "SHIPPED"].includes(currentStatus)) {
      return;
    }
  }

  const allowed = allowedTransitions[currentStatus] ?? [];
  if (!allowed.includes(nextStatus)) {
    throw new Error(`Invalid order status transition from ${currentStatus} to ${nextStatus}.`);
  }
};

const assertPaymentAllowsOrderFulfillment = (
  paymentStatus: string | null | undefined,
  nextStatus: string
) => {
  if (!FULFILLMENT_STATUSES.has(nextStatus)) {
    return;
  }

  if (paymentStatus === "FAILED") {
    throw new Error("Cannot process this order because payment has failed.");
  }

  if (paymentStatus !== "COMPLETED") {
    throw new Error("Cannot process this order because payment is not completed.");
  }
};

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

    const nextPaymentStatus =
      order.payment?.status === "COMPLETED"
        ? "REFUNDED"
        : order.payment?.status === "PENDING"
          ? "FAILED"
          : order.payment?.status ?? order.paymentStatus;

    await tx.payment.update({
      where: { orderId: order.id },
      data: {
        status: nextPaymentStatus,
      },
    });

    const cancelledOrder = await tx.order.update({
      where: { id: order.id },
      data: { status: "CANCELLED", paymentStatus: nextPaymentStatus },
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

    try {
      const refundNotice =
        nextPaymentStatus === "REFUNDED"
          ? `Your payment has been refunded and the order has been cancelled.`
          : `Your order has been cancelled and no payment was captured.`;

      await createNotification({
        userId,
        type: "PAYMENT",
        title: `Order ${order.orderNumber} cancelled`,
        message: refundNotice,
        actionUrl: `/orders/${order.id}`,
      });
    } catch (err) {
      console.error("Failed to create cancellation notification", err);
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
      order: {
        include: {
          payment: true,
        },
      },
    },
  });

  if (!vendorOrder) {
    throw new Error("Vendor order not found");
  }

  if (vendorOrder.shop.sellerId !== sellerId) {
    throw new Error("Access denied");
  }

  const currentPaymentStatus = vendorOrder.order.payment?.status ?? vendorOrder.order.paymentStatus;

  assertValidOrderStatusTransition(vendorOrder.status, input.status);
  assertPaymentAllowsOrderFulfillment(currentPaymentStatus, input.status);

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

  // Sync parent Order status while preserving the trusted persisted payment state
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

    await prisma.order.update({
      where: { id: updated.orderId },
      data: {
        status: newOrderStatus,
      },
    });
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
      actionUrl: `/orders/${updated.order.id}`,
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
    include: {
      payment: true,
    },
  });

  if (!order) {
    throw new Error("Order not found");
  }

  const currentPaymentStatus = order.payment?.status ?? order.paymentStatus;

  assertValidOrderStatusTransition(order.status, input.status);
  assertPaymentAllowsOrderFulfillment(currentPaymentStatus, input.status);

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
      actionUrl: `/orders/${updated.id}`,
    });
  } catch (err) {
    console.error("Failed to create notification for order status change", err);
  }

  return {
    ...mapOrder(updated),
    user: updated.user,
  };
};

export const processOrderRefund = async (
  orderId: string,
  input: { reason?: string; deductShipping?: boolean; actionById?: string }
) => {
  const { reason = "Customer return request", deductShipping = true, actionById } = input;

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      user: true,
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

  if (order.paymentStatus === "REFUNDED") {
    throw new Error("Order has already been refunded");
  }

  const orderTotal = order.totalAmount;
  const shippingAmount = order.shippingAmount;
  const nonRefundableShipping = deductShipping ? shippingAmount : new Decimal(0);
  const refundAmount = orderTotal.sub(nonRefundableShipping);
  const finalRefundAmount = refundAmount.lt(new Decimal(0)) ? new Decimal(0) : refundAmount;

  return await prisma.$transaction(async (tx) => {
    // 1. Cancel vendor orders
    await Promise.all(
      order.vendorOrders.map((vo: any) =>
        tx.vendorOrder.update({
          where: { id: vo.id },
          data: { status: "CANCELLED" },
        })
      )
    );

    // 2. Restock inventory for all items
    await Promise.all(
      order.vendorOrders.flatMap((vo: any) =>
        vo.items.map((item: any) => {
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

    // 3. Update payment status to REFUNDED
    await tx.payment.update({
      where: { orderId: order.id },
      data: {
        status: "REFUNDED",
      },
    });

    // 4. Update order status to CANCELLED and paymentStatus to REFUNDED
    const refundedOrder = await tx.order.update({
      where: { id: order.id },
      data: {
        status: "CANCELLED",
        paymentStatus: "REFUNDED",
      },
      include: {
        user: true,
        payment: true,
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
      },
    });

    // 5. Create order status history
    try {
      await tx.orderStatusHistory.create({
        data: {
          orderId: order.id,
          previousStatus: order.status,
          newStatus: "CANCELLED",
          changedById: actionById || null,
        },
      });
    } catch (err) {
      console.error("Failed to create order status history for refund", err);
    }

    // 6. Send notification to customer
    try {
      const shippingDeductionNote = deductShipping && shippingAmount.gt(new Decimal(0))
        ? ` ($${shippingAmount.toFixed(2)} delivery charge deducted as per return policy)`
        : "";

      await createNotification({
        userId: order.userId,
        type: "PAYMENT",
        title: `Refund Processed for Order #${order.orderNumber}`,
        message: `Your refund of $${finalRefundAmount.toFixed(2)} has been processed${shippingDeductionNote}. Reason: ${reason}`,
        actionUrl: `/orders/${order.id}`,
      });
    } catch (err) {
      console.error("Failed to create refund notification", err);
    }

    return {
      ...mapOrder(refundedOrder),
      user: refundedOrder.user,
      refundSummary: {
        subtotal: order.subtotal.toNumber(),
        discount: order.discount.toNumber(),
        shippingAmount: order.shippingAmount.toNumber(),
        nonRefundableShippingDeducted: nonRefundableShipping.toNumber(),
        refundAmount: finalRefundAmount.toNumber(),
        reason,
      },
    };
  });
};

