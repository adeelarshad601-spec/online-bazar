import { Response } from "express";
import { productSearchSchema, suggestionSchema } from "../validators/search.validator.js";
import { AuthRequest } from "../middleware/auth.middleware.js";
import { searchProducts, searchSuggestions } from "../services/search.service.js";

export const productSearch = async (req: AuthRequest, res: Response) => {
  try {
    const validation = productSearchSchema.safeParse(req.query);
    if (!validation.success) {
      return res.status(400).json({ success: false, message: "Invalid query", errors: validation.error.issues });
    }

    const data = await searchProducts(validation.data);

    return res.status(200).json({ success: true, message: "Products fetched successfully", data });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

export const suggestions = async (req: AuthRequest, res: Response) => {
  try {
    const validation = suggestionSchema.safeParse(req.query);
    if (!validation.success) {
      return res.status(400).json({ success: false, message: "Invalid query", errors: validation.error.issues });
    }

    const data = await searchSuggestions(validation.data.q, 7);

    return res.status(200).json({ success: true, message: "Search suggestions fetched successfully", data });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};
