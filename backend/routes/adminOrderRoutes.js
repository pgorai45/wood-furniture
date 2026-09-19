const express = require("express");
const router = express.Router();

const db = require("../config/db");

const { verifyToken, adminOnly } = require("../middleware/authMiddleware");

// ================= GET ALL ORDERS =================

// ================= GET ALL ORDERS =================

router.get("/", verifyToken, adminOnly, (req, res) => {
  const sql = `
        SELECT
            orders.id,
            orders.user_id,
            COALESCE(orders.shipping_name, users.name) AS user_name,
            users.email AS user_email,
            COALESCE(orders.shipping_phone, users.phone) AS user_phone,
            orders.shipping_address,
            orders.payment_method,
            orders.total_amount,
            orders.status,
            orders.created_at
        FROM orders
        JOIN users ON orders.user_id = users.id
        ORDER BY orders.id DESC
    `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Admin orders fetch error:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch orders",
      });
    }

    res.json({
      success: true,
      orders: results,
    });
  });
});

// ================= UPDATE ORDER STATUS =================

router.put("/:id/status", verifyToken, adminOnly, (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const allowedStatuses = [
    "Pending",
    "Confirmed",
    "Shipped",
    "Delivered",
    "Cancelled",
  ];

  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: "Invalid order status",
    });
  }

  // Check previous status
  db.query("SELECT status FROM orders WHERE id = ?", [id], (prevErr, prevResults) => {
    if (prevErr) {
      return res.status(500).json({ success: false, message: "Database error checking order" });
    }

    if (!prevResults || prevResults.length === 0) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    const prevStatus = prevResults[0].status;

    const sql = `
        UPDATE orders
        SET status = ?
        WHERE id = ?
    `;

    db.query(sql, [status, id], (err, result) => {
      if (err) {
        console.error("Order status update error:", err);
        return res.status(500).json({
          success: false,
          message: "Failed to update order status",
        });
      }

      // If status changed to Cancelled from an active status, restore stock
      if (status === "Cancelled" && prevStatus !== "Cancelled") {
        db.query(
          "SELECT product_id, quantity FROM order_items WHERE order_id = ?",
          [id],
          (itemErr, items) => {
            if (!itemErr && items) {
              items.forEach((item) => {
                db.query(
                  "UPDATE products SET stock = stock + ? WHERE id = ?",
                  [item.quantity, item.product_id],
                  () => {}
                );
              });
            }
          }
        );
      }

      res.json({
        success: true,
        message: `Order status updated to ${status} successfully`,
      });
    });
  });
});

// ================= GET ORDER DETAILS =================

router.get("/:id", verifyToken, adminOnly, (req, res) => {
  const { id } = req.params;

  const sql = `
        SELECT
            order_items.id,
            order_items.order_id,
            order_items.product_id,
            products.name AS product_name,
            products.image,
            products.category,
            order_items.quantity,
            order_items.price
        FROM order_items
        JOIN products ON order_items.product_id = products.id
        WHERE order_items.order_id = ?
    `;

  db.query(sql, [id], (err, results) => {
    if (err) {
      console.error("Order details error:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch order details",
      });
    }

    res.json({
      success: true,
      items: results,
    });
  });
});

module.exports = router;
