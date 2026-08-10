import { Router } from "express";
import {
  create,
  getAll,
  getOne,
  update,
  remove,
} from "../controllers/category.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";

const router = Router();

router.post(
  "/",
  authenticate,
  authorize("ADMIN"),
  create
);
router.get("/", getAll);
router.get("/:id", getOne);
router.patch(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  update
);
router.delete(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  remove
);

export default router;
