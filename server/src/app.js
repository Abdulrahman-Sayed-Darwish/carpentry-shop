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
const { notFoundHandler, errorHandler } = require("./middlewares/errorHandler");
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
app.use(notFoundHandler);
app.use(errorHandler);
const PORT = process.env.PORT || 5000;
connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
