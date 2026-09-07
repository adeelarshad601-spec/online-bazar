import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { getAddressesHandler, createAddressHandler, deleteAddressHandler } from "../controllers/address.controller.js";

const router = Router();

router.get("/", authenticate, getAddressesHandler);
router.post("/", authenticate, createAddressHandler);
router.delete("/:id", authenticate, deleteAddressHandler);

export default router;
