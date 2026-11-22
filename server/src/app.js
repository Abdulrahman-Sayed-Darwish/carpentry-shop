require("dotenv").config();
const express = require("express");
const cors = require("cors");
const categoriesRoutes = require("./routes/categoriesRoutes");
const worksRoutes = require("./routes/worksRoutes");
const cookieParser = require("cookie-parser");
const authRoutes = require("./routes/authRoutes");
const app = express();
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());
const connectDB = require("./config/db");
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});
app.use("/api/auth", authRoutes);
app.use("/api/categories", categoriesRoutes);
app.use("/api/works", worksRoutes);

app.use((err, req, res, next) => {
  if (err.code === 11000) {
    return res.status(409).json({
      error: "DUPLICATE",
      message: "القيمة دي موجودة قبل كده",
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
