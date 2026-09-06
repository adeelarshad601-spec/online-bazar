import prisma from "../config/database.js";
import { PaymentStatusUpdateInput } from "../validators/payment.validator.js";

export const getPaymentByOrderId = async (userId: string, role: string, orderId: string) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { payment: true, user: true },
  });

  if (!order || !order.payment) {
    throw new Error("Payment not found");
  }

  if (role !== "ADMIN" && order.userId !== userId) {
    throw new Error("Access denied");
  }

  return order.payment;
};

export const getPaymentById = async (userId: string, role: string, paymentId: string) => {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: { order: true },
  });

  if (!payment) {
    throw new Error("Payment not found");
  }

  if (role !== "ADMIN" && payment.order.userId !== userId) {
    throw new Error("Access denied");
  }

  return payment;
};

export const updatePaymentStatus = async (paymentId: string, input: PaymentStatusUpdateInput) => {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: { order: true },
  });

  if (!payment) {
    throw new Error("Payment not found");
  }

  const updated = await prisma.$transaction(async (tx) => {
    const paymentUpdate = await tx.payment.update({
      where: { id: paymentId },
      data: {
        status: input.status,
        paidAt: input.status === "COMPLETED" ? new Date() : payment.paidAt,
      },
    });

    const orderUpdate = await tx.order.update({
      where: { id: payment.orderId },
      data: {
        paymentStatus: input.status,
      },
    });

    return {
      ...paymentUpdate,
      paidAt: paymentUpdate.paidAt,
      order: orderUpdate,
    };
  });

  return updated;
};

export const processTestPayment = async (
  userId: string,
  role: string,
  paymentId: string,
  action: "SUCCESS" | "FAILED"
) => {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: { order: true },
  });

  if (!payment) {
    throw new Error("Payment not found");
  }

  if (role !== "ADMIN" && payment.order.userId !== userId) {
    throw new Error("Access denied");
  }

  if (payment.status !== "PENDING") {
    throw new Error(`Payment has already been processed with status ${payment.status}`);
  }

  const transactionId = `TEST-TXN-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

  const updated = await prisma.$transaction(async (tx) => {
    const isSuccess = action === "SUCCESS";
    const paymentStatus = isSuccess ? "COMPLETED" : "FAILED";

    const paymentUpdate = await tx.payment.update({
      where: { id: paymentId },
      data: {
        status: paymentStatus,
        transactionId: isSuccess ? transactionId : null,
        paidAt: isSuccess ? new Date() : null,
      },
    });

    const orderUpdate = await tx.order.update({
      where: { id: payment.orderId },
      data: {
        paymentStatus: paymentStatus,
      },
    });

    return {
      ...paymentUpdate,
      order: orderUpdate,
    };
  });

  return updated;
};

