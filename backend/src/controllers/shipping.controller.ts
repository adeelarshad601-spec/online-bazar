import { Request, Response } from "express";
import { Decimal } from "@prisma/client/runtime/client";
import prisma from "../config/database.js";
import {
  calculateShippingQuote,
  getAllShippingZones,
  getShippingZoneById,
  createShippingZone,
  updateShippingZone,
  deleteShippingZone,
} from "../services/shipping.service.js";

export const getShippingQuoteHandler = async (req: Request, res: Response): Promise<any> => {
  try {
    const { shippingAddress, buyNowItem, selectedCartItemIds } = req.body;

    if (!shippingAddress || !shippingAddress.city || !shippingAddress.country) {
      return res.status(400).json({
        success: false,
        message: "Shipping address with city and country is required",
      });
    }

    const userId = (req as any).user?.id;
    let rawItems: Array<{ productId: string; variantId?: string | null; quantity: number }> = [];

    if (buyNowItem && buyNowItem.productId) {
      rawItems = [
        {
          productId: buyNowItem.productId,
          variantId: buyNowItem.variantId || null,
          quantity: buyNowItem.quantity || 1,
        },
      ];
    } else if (userId) {
      const cart = await prisma.cart.findUnique({
        where: { userId },
        include: { items: true },
      });

      if (cart && cart.items.length > 0) {
        const selectedIds = new Set((selectedCartItemIds || []).filter(Boolean));
        const filteredItems = selectedIds.size > 0
          ? cart.items.filter((item) => selectedIds.has(item.id))
          : cart.items;

        rawItems = filteredItems.map((item) => ({
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
        }));
      }
    }

    const vendorGroupMap: Record<
      string,
      {
        subtotal: Decimal;
        totalWeight: Decimal;
        shop: any;
      }
    > = {};

    if (rawItems.length > 0) {
      await Promise.all(
        rawItems.map(async (item) => {
          const product = await prisma.product.findUnique({
            where: { id: item.productId },
            include: {
              shop: {
                select: {
                  id: true,
                  name: true,
                  pickupAddress: true,
                  pickupCity: true,
                  pickupState: true,
                  pickupCountry: true,
                  pickupPostalCode: true,
                },
              },
            },
          });

          if (!product) return;

          let unitPrice = product.price;
          if (item.variantId) {
            const variant = await prisma.productVariant.findUnique({
              where: { id: item.variantId },
              select: { price: true },
            });
            if (variant && variant.price) {
              unitPrice = variant.price;
            }
          }

          const itemSubtotal = unitPrice.mul(item.quantity);
          const itemWeight = (product.weight || new Decimal(0)).mul(item.quantity);
          const shopId = product.shopId;

          if (!vendorGroupMap[shopId]) {
            vendorGroupMap[shopId] = {
              subtotal: new Decimal(0),
              totalWeight: new Decimal(0),
              shop: product.shop,
            };
          }
          vendorGroupMap[shopId].subtotal = vendorGroupMap[shopId].subtotal.add(itemSubtotal);
          vendorGroupMap[shopId].totalWeight = vendorGroupMap[shopId].totalWeight.add(itemWeight);
        })
      );
    }

    const vendorSubtotals = Object.entries(vendorGroupMap).map(([shopId, data]) => ({
      shopId,
      subtotal: data.subtotal,
      totalWeight: data.totalWeight,
      origin: {
        address: data.shop?.pickupAddress || null,
        city: data.shop?.pickupCity || null,
        state: data.shop?.pickupState || null,
        country: data.shop?.pickupCountry || "Pakistan",
        postalCode: data.shop?.pickupPostalCode || null,
      },
    }));

    if (vendorSubtotals.length === 0) {
      vendorSubtotals.push({
        shopId: "default",
        subtotal: new Decimal(0),
        totalWeight: new Decimal(0),
        origin: { city: "Lahore", country: "Pakistan" },
      });
    }

    const result = await calculateShippingQuote(
      {
        country: shippingAddress.country,
        state: shippingAddress.state || null,
        city: shippingAddress.city,
        postalCode: shippingAddress.postalCode || null,
      },
      vendorSubtotals
    );

    return res.status(200).json({
      success: true,
      message: result.message,
      data: {
        isDeliverable: result.isDeliverable,
        matchedZone: result.matchedZone,
        shippingAmount: result.totalShippingAmount.toNumber(),
        vendorShipping: Object.fromEntries(
          Object.entries(result.vendorShippingMap).map(([k, v]) => [k, v.toNumber()])
        ),
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to calculate shipping quote",
    });
  }
};

export const getShippingZonesHandler = async (_req: Request, res: Response): Promise<any> => {
  try {
    const zones = await getAllShippingZones();
    return res.status(200).json({
      success: true,
      data: zones,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch shipping zones",
    });
  }
};

export const getShippingZoneByIdHandler = async (req: Request, res: Response): Promise<any> => {
  try {
    const zoneId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const zone = await getShippingZoneById(zoneId);
    return res.status(200).json({
      success: true,
      data: zone,
    });
  } catch (error: any) {
    return res.status(404).json({
      success: false,
      message: error.message || "Shipping zone not found",
    });
  }
};

export const createShippingZoneHandler = async (req: Request, res: Response): Promise<any> => {
  try {
    const zone = await createShippingZone(req.body);
    return res.status(201).json({
      success: true,
      message: "Shipping zone created successfully",
      data: zone,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to create shipping zone",
    });
  }
};

export const updateShippingZoneHandler = async (req: Request, res: Response): Promise<any> => {
  try {
    const zoneId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const zone = await updateShippingZone(zoneId, req.body);
    return res.status(200).json({
      success: true,
      message: "Shipping zone updated successfully",
      data: zone,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to update shipping zone",
    });
  }
};

export const deleteShippingZoneHandler = async (req: Request, res: Response): Promise<any> => {
  try {
    const zoneId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    await deleteShippingZone(zoneId);
    return res.status(200).json({
      success: true,
      message: "Shipping zone deleted successfully",
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to delete shipping zone",
    });
  }
};
