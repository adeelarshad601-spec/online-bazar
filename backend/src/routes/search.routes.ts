import { Router } from "express";
import { productSearch, suggestions } from "../controllers/search.controller.js";

const router = Router();

router.get("/", productSearch);
router.get("/suggestions", suggestions);

export default router;
