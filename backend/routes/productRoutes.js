const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { verifyToken, adminOnly } = require("../middleware/authMiddleware");

// ================= GET ALL PRODUCTS =================

router.get("/", (req, res) => {
  const sql = "SELECT * FROM products ORDER BY id DESC";

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Product fetch error:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch products",
      });
    }

    res.json({
      success: true,
      products: results,
    });
  });
});

// ================= GET SINGLE PRODUCT BY ID =================

router.get("/:id", (req, res) => {
  const productId = parseInt(req.params.id);

  if (isNaN(productId) || productId <= 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid product ID",
    });
  }

  const sql = "SELECT * FROM products WHERE id = ? LIMIT 1";

  db.query(sql, [productId], (err, results) => {
    if (err) {
      console.error("Single product fetch error:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch product",
      });
    }

    if (!results || results.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.json({
      success: true,
      product: results[0],
    });
  });
});

// ================= ADD PRODUCT (ADMIN ONLY) =================

router.post("/", verifyToken, adminOnly, (req, res) => {
  const {
    name,
    image,
    price,
    old_price,
    discount,
    rating,
    reviews,
    colors,
    delivery,
    badge,
    category,
    stock,
  } = req.body;

  if (!name || name.trim() === "") {
    return res.status(400).json({
      success: false,
      message: "Product name is required",
    });
  }

  const parsedPrice = parseFloat(price);
  if (isNaN(parsedPrice) || parsedPrice < 0) {
    return res.status(400).json({
      success: false,
      message: "Valid product price is required",
    });
  }

  const sql = `
    INSERT INTO products
    (name, image, price, old_price, discount, rating, reviews, colors, delivery, badge, category, stock)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    name.trim(),
    image || null,
    parsedPrice,
    parseFloat(old_price) || 0,
    discount || null,
    parseFloat(rating) || 4.5,
    parseInt(reviews) || 0,
    colors || null,
    delivery || null,
    badge || null,
    category ? category.trim() : "Uncategorized",
    parseInt(stock) || 50,
  ];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error("Product insert error:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to add product",
      });
    }

    res.status(201).json({
      success: true,
      message: "Product added successfully",
      productId: result.insertId,
    });
  });
});

module.exports = router;