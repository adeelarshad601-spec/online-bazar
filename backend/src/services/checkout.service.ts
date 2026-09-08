import { Decimal } from "@prisma/client/runtime/client";
import prisma from "../config/database.js";
import { CheckoutInput } from "../validators/checkout.validator.js";
import { createNotification } from "./notification.service.js";
import { calculateShippingQuote } from "./shipping.service.js";

const mapOrderItem = (item: any) => ({
  id: item.id,
  productId: item.productId,
  variantId: item.variantId,
  price: item.price,
  quantity: item.quantity,
  createdAt: item.createdAt,
});

const mapVendorOrder = (vendorOrder: any) => ({
  id: vendorOrder.id,
  shopId: vendorOrder.shopId,
  status: vendorOrder.status,
  subTotal: vendorOrder.subTotal,
  shippingAmount: vendorOrder.shippingAmount,
  createdAt: vendorOrder.createdAt,
  items: vendorOrder.items ? vendorOrder.items.map(mapOrderItem) : [],
});

export const processCheckout = async (userId: string, input: CheckoutInput) => {
  const { shippingAddress, paymentMethod, couponCode, buyNowItem } = input;

  let rawItems: Array<{ productId: string; variantId?: string | null; quantity: number }> = [];
  let lockedCartId: string | null = null;

  if (buyNowItem) {
    rawItems = [
      {
        productId: buyNowItem.productId,
        variantId: buyNowItem.variantId || null,
        quantity: buyNowItem.quantity || 1,
      },
    ];
  } else {
    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: true,
      },
    });

    if (!cart || cart.items.length === 0) {
      throw new Error("Cart is empty");
    }

    lockedCartId = cart.id;
    rawItems = cart.items.map((item) => ({
      productId: item.productId,
      variantId: item.variantId,
      quantity: item.quantity,
    }));
  }

  const coupon = couponCode
    ? await prisma.coupon.findUnique({
        where: { code: couponCode },
      })
    : null;

  if (couponCode && !coupon) {
    throw new Error("Coupon not found");
  }

  if (coupon) {
    if (!coupon.isActive) {
      throw new Error("Coupon is not active");
    }

    if (coupon.expiresAt && coupon.expiresAt < new Date()) {
      throw new Error("Coupon has expired");
    }

    if (coupon.usageLimit !== null && coupon.usageLimit !== undefined) {
      if (coupon.usedCount >= coupon.usageLimit) {
        throw new Error("Coupon has reached its usage limit");
      }
    }
  }

  const checkedItems = await Promise.all(
    rawItems.map(async (item) => {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      });

      if (!product) {
        throw new Error("Product not found");
      }

      if (product.status !== "APPROVED" || !product.isActive) {
        throw new Error("Product is not available");
      }

      if (item.variantId) {
        const variant = await prisma.productVariant.findUnique({
          where: { id: item.variantId },
        });

        if (!variant) {
          throw new Error("Variant not found");
        }
        if (variant.productId !== product.id) {
          throw new Error("Variant does not belong to product");
        }
        if (!variant.isActive) {
          throw new Error("Variant is not available");
        }
        if (variant.stock < item.quantity) {
          throw new Error("Variant is out of stock");
        }

        return {
          product,
          variant,
          quantity: item.quantity,
          unitPrice: variant.price ?? product.price,
          subtotal: (variant.price ?? product.price).mul(item.quantity),
        };
      }

      if (product.stock < item.quantity) {
        throw new Error("Product is out of stock");
      }

      return {
        product,
        variant: null,
        quantity: item.quantity,
        unitPrice: product.price,
        subtotal: product.price.mul(item.quantity),
      };
    })
  );

  const orderSubTotal = checkedItems.reduce(
    (sum, item) => sum.add(item.subtotal),
    new Decimal(0)
  );

  let discountAmount = new Decimal(0);
  let couponId: string | null = null;

  if (coupon) {
    if (coupon.minOrderAmount && orderSubTotal.lt(coupon.minOrderAmount)) {
      throw new Error("Order total does not meet coupon minimum amount");
    }

    couponId = coupon.id;
    if (coupon.type === "PERCENTAGE") {
      discountAmount = orderSubTotal.mul(coupon.value).div(new Decimal(100));
    } else {
      discountAmount = coupon.value;
    }

    if (coupon.maxDiscount && discountAmount.gt(coupon.maxDiscount)) {
      discountAmount = coupon.maxDiscount;
    }

    if (discountAmount.lt(new Decimal(0))) {
      discountAmount = new Decimal(0);
    }
  }

  // Calculate Shipping Authoritatively on Backend
  const vendorSubtotalsMap: Record<string, Decimal> = {};
  for (const item of checkedItems) {
    const shopId = item.product.shopId;
    if (!vendorSubtotalsMap[shopId]) {
      vendorSubtotalsMap[shopId] = new Decimal(0);
    }
    vendorSubtotalsMap[shopId] = vendorSubtotalsMap[shopId].add(item.subtotal);
  }

  const vendorSubtotalsList = Object.entries(vendorSubtotalsMap).map(([shopId, subtotal]) => ({
    shopId,
    subtotal,
  }));

  const shippingResult = await calculateShippingQuote(
    {
      country: shippingAddress.country,
      state: shippingAddress.state || null,
      city: shippingAddress.city,
      postalCode: shippingAddress.postalCode || null,
    },
    vendorSubtotalsList
  );

  if (!shippingResult.isDeliverable) {
    throw new Error(shippingResult.message || "Sorry, we currently don't deliver to this location.");
  }

  const shippingAmount = shippingResult.totalShippingAmount;
  const totalAmount = orderSubTotal.sub(discountAmount).add(shippingAmount);

  const orderNumber = `OB-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)
    .toUpperCase()}`;

  const completedOrder = await prisma.$transaction(async (tx) => {
    const lockedCheckedItems = await Promise.all(
      rawItems.map(async (item) => {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (!product) {
          throw new Error("Product not found");
        }
        if (product.status !== "APPROVED" || !product.isActive) {
          throw new Error("Product is not available");
        }

        if (item.variantId) {
          const variant = await tx.productVariant.findUnique({
            where: { id: item.variantId },
          });
          if (!variant) {
            throw new Error("Variant not found");
          }
          if (!variant.isActive) {
            throw new Error("Variant is not available");
          }
          if (variant.stock < item.quantity) {
            throw new Error("Variant is out of stock");
          }
          return {
            product,
            variant,
            quantity: item.quantity,
            unitPrice: variant.price ?? product.price,
            subtotal: (variant.price ?? product.price).mul(item.quantity),
          };
        }

        if (product.stock < item.quantity) {
          throw new Error("Product is out of stock");
        }

        return {
          product,
          variant: null,
          quantity: item.quantity,
          unitPrice: product.price,
          subtotal: product.price.mul(item.quantity),
        };
      })
    );

    const isCardMethod = paymentMethod === "STRIPE" || paymentMethod === "CARD";

    const order = await tx.order.create({
      data: {
        orderNumber,
        userId,
        subtotal: orderSubTotal,
        discount: discountAmount,
        shippingAmount,
        totalAmount,
        shippingZone: shippingResult.matchedZone?.name || "Standard",
        shippingMethod: "Standard",
        paymentStatus: "PENDING",
        status: "PENDING",
        shippingAddress: shippingAddress as any,
        couponId,
      },
    });

    const vendorGroups = lockedCheckedItems.reduce((groups, item) => {
      const shopId = item.product.shopId;
      if (!groups[shopId]) {
        groups[shopId] = {
          shopId,
          items: [],
          subTotal: new Decimal(0),
        };
      }
      groups[shopId].items.push(item);
      groups[shopId].subTotal = groups[shopId].subTotal.add(item.subtotal);
      return groups;
    }, {} as Record<string, { shopId: string; items: any[]; subTotal: Decimal }>);

    const vendorOrderRecords = await Promise.all(
      Object.values(vendorGroups).map(async (group) => {
        const vendorShipping = shippingResult.vendorShippingMap[group.shopId] || new Decimal(0);
        const vendorOrder = await tx.vendorOrder.create({
          data: {
            orderId: order.id,
            shopId: group.shopId,
            subTotal: group.subTotal,
            shippingAmount: vendorShipping,
          },
        });

        const orderItemPromises = group.items.map((item) =>
          tx.orderItem.create({
            data: {
              vendorOrderId: vendorOrder.id,
              productId: item.product.id,
              variantId: item.variant?.id ?? null,
              price: item.unitPrice,
              quantity: item.quantity,
            },
          })
        );

        const items = await Promise.all(orderItemPromises);

        return {
          ...vendorOrder,
          items,
        };
      })
    );

    const createdPayment = await tx.payment.create({
      data: {
        orderId: order.id,
        method: isCardMethod ? "CARD" : "COD",
        status: "PENDING",
        amount: totalAmount,
      },
    });

    const stockUpdates = lockedCheckedItems.map((item) => {
      if (item.variant) {
        return tx.productVariant.update({
          where: { id: item.variant.id },
          data: {
            stock: item.variant.stock - item.quantity,
          },
        });
      }
      return tx.product.update({
        where: { id: item.product.id },
        data: {
          stock: item.product.stock - item.quantity,
        },
      });
    });

    await Promise.all(stockUpdates);

    if (!buyNowItem && lockedCartId) {
      await tx.cartItem.deleteMany({
        where: { cartId: lockedCartId },
      });
    }

    if (coupon) {
      await tx.coupon.update({
        where: { id: coupon.id },
        data: {
          usedCount: coupon.usedCount + 1,
        },
      });

      await tx.couponUsage.create({
        data: {
          couponId: coupon.id,
          userId,
        },
      });
    }

    return {
      id: order.id,
      orderNumber: order.orderNumber,
      subtotal: order.subtotal,
      discount: order.discount,
      shippingAmount: order.shippingAmount,
      totalAmount: order.totalAmount,
      paymentStatus: order.paymentStatus,
      shippingAddress: order.shippingAddress,
      vendorOrders: vendorOrderRecords.map(mapVendorOrder),
      orderItems: vendorOrderRecords.flatMap((vendorOrder) => vendorOrder.items.map(mapOrderItem)),
      payment: {
        id: createdPayment.id,
        method: createdPayment.method,
        status: createdPayment.status,
        amount: createdPayment.amount,
      },
      couponId,
      createdAt: order.createdAt,
    };
  });

  const shopIds = completedOrder.vendorOrders.map((vendorOrder) => vendorOrder.shopId);
  const shops = await prisma.shop.findMany({
    where: { id: { in: shopIds } },
    select: { id: true, name: true, sellerId: true },
  });

  await Promise.all(
    shops.map((shop) =>
      createNotification({
        userId: shop.sellerId,
        type: "ORDER",
        title: "New order received",
        message: `A new order has been placed for products from ${shop.name}.`,
        actionUrl: "/seller/orders",
      })
    )
  );

  return completedOrder;
};
