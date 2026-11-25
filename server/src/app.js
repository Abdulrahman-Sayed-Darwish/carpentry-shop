require("dotenv").config();
const express = require("express");
const cors = require("cors");
const categoriesRoutes = require("./routes/categoriesRoutes");
const worksRoutes = require("./routes/worksRoutes");
const cookieParser = require("cookie-parser");
const authRoutes = require("./routes/authRoutes");
const uploadsRoutes = require("./routes/uploadsRoutes");
const productsRoutes = require("./routes/productsRoutes");
const ordersRoutes = require("./routes/ordersRoutes");
const customRequestsRoutes = require("./routes/customRequestsRoutes");
const helmet = require("helmet");
const { generalLimiter } = require("./middlewares/rateLimiters");
const app = express();
if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());
app.use("/api", generalLimiter);
const connectDB = require("./config/db");
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});
app.use("/api/auth", authRoutes);
app.use("/api/uploads", uploadsRoutes);
app.use("/api/categories", categoriesRoutes);
app.use("/api/works", worksRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/orders", ordersRoutes);
app.use("/api/custom-requests", customRequestsRoutes);
// midleware handler error
app.use((err, req, res, next) => {
  if (err.code === 11000) {
    return res.status(409).json({
      error: "DUPLICATE",
      message: "القيمة دي موجودة قبل كده",
    });
  }
  if (err.message === "INVALID_FILE_TYPE") {
    return res.status(400).json({
      error: "INVALID_FILE_TYPE",
      message: "مسموح بصور JPG أو PNG أو WebP بس",
    });
  }
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({
      error: "FILE_TOO_LARGE",
      message: "حجم الصورة أكبر من 5MB",
    });
  }
  if (err.code === "LIMIT_UNEXPECTED_FILE") {
    return res.status(400).json({
      error: "TOO_MANY_FILES",
      message: "أقصى عدد 10 صور في المرة",
    });
  }
  console.error(err);
  res
    .status(500)
    .json({ error: "SERVER_ERROR", message: "حصل خطأ في السيرفر" });
});
const PORT = process.env.PORT || 5000;
connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
