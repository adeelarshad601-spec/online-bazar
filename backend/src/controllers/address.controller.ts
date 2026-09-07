import { Request, Response } from "express";
import { getUserAddresses, createUserAddress, deleteUserAddress } from "../services/address.service.js";

export const getAddressesHandler = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = (req as any).user.id;
    const addresses = await getUserAddresses(userId);
    return res.status(200).json({
      success: true,
      data: addresses,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch addresses",
    });
  }
};

export const createAddressHandler = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = (req as any).user.id;
    const address = await createUserAddress(userId, req.body);
    return res.status(201).json({
      success: true,
      message: "Address saved successfully",
      data: address,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to create address",
    });
  }
};

export const deleteAddressHandler = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = (req as any).user.id;
    const addressId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    await deleteUserAddress(userId, addressId);
    return res.status(200).json({
      success: true,
      message: "Address deleted successfully",
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to delete address",
    });
  }
};
