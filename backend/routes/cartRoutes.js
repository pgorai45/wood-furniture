const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { verifyToken } = require("../middleware/authMiddleware");


// ================= ADD TO CART (AUTHENTICATED) =================
// Never trust userId from frontend body; extract strictly from verified JWT
router.post("/add", verifyToken, (req, res) => {
  const userId = req.user.id;
  const productId = parseInt(req.body.product_id);
  const quantity = Math.max(1, parseInt(req.body.quantity) || 1);

  if (!productId || isNaN(productId) || productId <= 0) {
    return res.status(400).json({
      success: false,
      message: "Valid product ID is required",
    });
  }

  const sql = `
    INSERT INTO cart (user_id, product_id, quantity)
    VALUES (?, ?, ?)
    ON DUPLICATE KEY UPDATE
    quantity = quantity + VALUES(quantity)
  `;

  db.query(sql, [userId, productId, quantity], (err) => {
    if (err) {
      console.error("Add to cart DB error:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to add product to cart",
      });
    }

    res.status(201).json({
      success: true,
      message: "Product added to cart",
    });
  });
});

// ================= GET CART ITEMS (AUTHENTICATED) =================

router.get("/", verifyToken, (req, res) => {
  const userId = req.user.id;

  const sql = `
    SELECT 
      c.id,
      c.user_id,
      c.product_id,
      c.quantity,
      c.created_at,
      p.name,
      p.price,
      p.image,
      p.delivery
    FROM cart c
    JOIN products p ON c.product_id = p.id
    WHERE c.user_id = ?
    ORDER BY c.id DESC
  `;

  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error("Fetch cart DB error:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch cart items",
      });
    }

    res.json({
      success: true,
      cart: results || [],
    });
  });
});

// ================= GET CART BY USER ID (IDOR PROTECTED) =================

router.get("/:userId", verifyToken, (req, res) => {
  const targetUserId = parseInt(req.params.userId);

  if (isNaN(targetUserId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid user ID parameter",
    });
  }

  // Prevent User A from querying User B's cart
  if (req.user.id !== targetUserId && req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Forbidden: You cannot access another customer's cart",
    });
  }

  const sql = `
    SELECT 
      c.id,
      c.user_id,
      c.product_id,
      c.quantity,
      c.created_at,
      p.name,
      p.price,
      p.image,
      p.delivery
    FROM cart c
    JOIN products p ON c.product_id = p.id
    WHERE c.user_id = ?
    ORDER BY c.id DESC
  `;

  db.query(sql, [targetUserId], (err, results) => {
    if (err) {
      console.error("Fetch cart DB error:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch cart items",
      });
    }

    res.json({
      success: true,
      cart: results || [],
    });
  });
});

// ================= CLEAR USER CART =================

router.delete("/clear", verifyToken, (req, res) => {
  const userId = req.user.id;

  db.query("DELETE FROM cart WHERE user_id = ?", [userId], (err) => {
    if (err) {
      console.error("Clear cart error:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to clear cart",
      });
    }

    res.json({
      success: true,
      message: "Cart cleared successfully",
    });
  });
});

module.exports = router;