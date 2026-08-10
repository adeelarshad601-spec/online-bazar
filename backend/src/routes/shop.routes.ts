import { Router } from "express";
import {
  create,
  getAll,
  getOne,
  getMine,
  update,
  remove,
} from "../controllers/shop.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";

const router = Router();

router.get("/", getAll);
router.get(
  "/mine",
  authenticate,
  authorize("SELLER", "ADMIN"),
  getMine
);
router.get("/:id", getOne);
router.post(
  "/",
  authenticate,
  authorize("SELLER"),
  create
);
router.patch(
  "/:id",
  authenticate,
  authorize("SELLER", "ADMIN"),
  update
);
router.delete(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  remove
);

export default router;
