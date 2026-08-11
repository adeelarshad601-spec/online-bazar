import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import productRoutes from "./routes/product.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import shopRoutes from "./routes/shop.routes.js";
import sellerRoutes from "./routes/seller.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import checkoutRoutes from "./routes/checkout.routes.js";
import orderRoutes from "./routes/order.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import reviewRoutes from "./routes/review.routes.js";
import wishlistRoutes from "./routes/wishlist.routes.js";
import couponRoutes from "./routes/coupon.routes.js";

const app = express();
app.use(cookieParser());
app.use(helmet());

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

// IMPORTANT: body parser routes se PEHLE hona chahiye
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(morgan("dev"));

app.get("/api/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Online-Bazar API is running",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/shops", shopRoutes);
app.use("/api/sellers", sellerRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/checkout", checkoutRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/coupons", couponRoutes);

export default app;