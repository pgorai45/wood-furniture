const express = require("express");
const cors = require("cors");
require("dotenv").config();

const db = require("./config/db");
const productRoutes = require("./routes/productRoutes");
const cartRoutes = require("./routes/cartRoutes");
const userRoutes = require("./routes/userRoutes");
const adminProductRoutes = require("./routes/adminProductRoutes");
const adminUserRoutes = require("./routes/adminUserRoutes");
const orderRoutes = require("./routes/orderRoutes");
const adminOrderRoutes = require("./routes/adminOrderRoutes");

const app = express();

app.use(cors());
app.use(express.json());

// ================= HOME =================

app.get("/", (req, res) => {
  res.json({
    message: "Bidyut Furniture Backend Running",
  });
});

// ================= ALL ROUTES =================

app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin/products", adminProductRoutes);
app.use("/api/admin/users", adminUserRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin/orders",adminOrderRoutes);

// ================= SERVER =================

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
