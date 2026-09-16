const express = require("express");
const router = express.Router();

const db = require("../config/db");

const { verifyToken, adminOnly } = require("../middleware/authMiddleware");

// ================= ADD PRODUCT =================

router.post("/add", verifyToken, adminOnly, (req, res) => {
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
  } = req.body;

  if (!name || !price || !category) {
    return res.status(400).json({
      success: false,
      message: "Name, price and category are required",
    });
  }

  const sql = `
        INSERT INTO products
        (name, image, price, old_price, discount, rating,
         reviews, colors, delivery, badge, category)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

  const values = [
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
  ];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error("Admin add product error:", err);

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

// ================= UPDATE PRODUCT =================

router.put("/update/:id", verifyToken, adminOnly, (req, res) => {
  const { id } = req.params;

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
  } = req.body;

  const sql = `
        UPDATE products
        SET
            name = ?,
            image = ?,
            price = ?,
            old_price = ?,
            discount = ?,
            rating = ?,
            reviews = ?,
            colors = ?,
            delivery = ?,
            badge = ?,
            category = ?
        WHERE id = ?
    `;

  const values = [
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
    id,
  ];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error("Admin update product error:", err);

      return res.status(500).json({
        success: false,
        message: "Failed to update product",
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.json({
      success: true,
      message: "Product updated successfully",
    });
  });
});

// ================= DELETE PRODUCT =================

router.delete("/delete/:id", verifyToken, adminOnly, (req, res) => {
  const { id } = req.params;

  const sql = "DELETE FROM products WHERE id = ?";

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("Admin delete product error:", err);

      return res.status(500).json({
        success: false,
        message: "Failed to delete product",
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.json({
      success: true,
      message: "Product deleted successfully",
    });
  });
});


// ================= GET ALL PRODUCTS FOR ADMIN =================

router.get("/", verifyToken, adminOnly, (req, res) => {

    const sql = "SELECT * FROM products ORDER BY id DESC";

    db.query(sql, (err, results) => {

        if (err) {

            console.error("Admin product fetch error:", err);

            return res.status(500).json({
                success: false,
                message: "Failed to fetch products"
            });

        }

        res.json({
            success: true,
            products: results
        });

    });

});

module.exports = router;
