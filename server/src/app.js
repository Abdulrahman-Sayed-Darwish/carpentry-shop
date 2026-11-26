require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const { generalLimiter } = require("./middlewares/rateLimiters");
const { notFoundHandler, errorHandler } = require("./middlewares/errorHandler");

const categoriesRoutes = require("./routes/categoriesRoutes");
const worksRoutes = require("./routes/worksRoutes");
const productsRoutes = require("./routes/productsRoutes");
const uploadsRoutes = require("./routes/uploadsRoutes");
const ordersRoutes = require("./routes/ordersRoutes");
const customRequestsRoutes = require("./routes/customRequestsRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();

if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

app.use(helmet());

// Allowed frontend origins, comma separated in CLIENT_URL
const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:5173")
  .split(",")
  .map((url) => url.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (Postman, curl, server-to-server)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());
app.use("/api", generalLimiter);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/categories", categoriesRoutes);
app.use("/api/works", worksRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/uploads", uploadsRoutes);
app.use("/api/orders", ordersRoutes);
app.use("/api/custom-requests", customRequestsRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
