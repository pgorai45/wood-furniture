const express = require("express");
const router = express.Router();

const db = require("../config/db");

// =====================================================
// CHECKOUT FROM FRONTEND CART
// =====================================================

router.post("/checkout", (req, res) => {
  const { user_id, items } = req.body;

  // Validate request

  if (!user_id || !items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Cart is empty",
    });
  }

  // Get product IDs

  const productIds = items.map((item) => Number(item.product_id));

  const placeholders = productIds.map(() => "?").join(",");

  // Get actual product prices from database

  const productSql = `
        SELECT id, price
        FROM products
        WHERE id IN (${placeholders})
    `;

  db.query(productSql, productIds, (productErr, products) => {
    if (productErr) {
      console.error("Product fetch error:", productErr);

      return res.status(500).json({
        success: false,
        message: "Failed to fetch products",
      });
    }

    // Check products

    if (products.length !== productIds.length) {
      return res.status(400).json({
        success: false,
        message: "One or more products not found",
      });
    }

    // =====================================================
    // CALCULATE TOTAL
    // =====================================================

    let subtotal = 0;

    items.forEach((item) => {
      const product = products.find(
        (p) => Number(p.id) === Number(item.product_id),
      );

      const quantity = Number(item.quantity) || 1;

      subtotal += Number(product.price) * quantity;
    });

    // 10% discount for subtotal >= ₹50,000

    const discount = subtotal >= 50000 ? Math.round(subtotal * 0.1) : 0;

    // 18% GST after discount

    const taxableAmount = subtotal - discount;

    const gst = Math.round(taxableAmount * 0.18);

    // Final amount

    const totalAmount = taxableAmount + gst;

    // =====================================================
    // CREATE ORDER
    // =====================================================

    const orderSql = `
                INSERT INTO orders
                (user_id, total_amount, status)
                VALUES (?, ?, 'Pending')
            `;

    db.query(orderSql, [user_id, totalAmount], (orderErr, orderResult) => {
      if (orderErr) {
        console.error("Order creation error:", orderErr);

        return res.status(500).json({
          success: false,
          message: "Failed to create order",
        });
      }

      const orderId = orderResult.insertId;

      // =====================================================
      // CREATE ORDER ITEMS
      // =====================================================

      const itemValues = items.map((item) => {
        const product = products.find(
          (p) => Number(p.id) === Number(item.product_id),
        );

        return [
          orderId,

          Number(item.product_id),

          Number(item.quantity) || 1,

          Number(product.price),
        ];
      });

      const itemSql = `
                        INSERT INTO order_items
                        (order_id, product_id, quantity, price)
                        VALUES ?
                    `;

      db.query(itemSql, [itemValues], (itemErr) => {
        if (itemErr) {
          console.error("Order items error:", itemErr);

          return res.status(500).json({
            success: false,
            message: "Failed to save order items",
          });
        }

        // =====================================================
        // SUCCESS
        // =====================================================

        res.status(201).json({
          success: true,

          message: "Order placed successfully",

          orderId: orderId,

          subtotal: subtotal,

          discount: discount,

          gst: gst,

          totalAmount: totalAmount,
        });
      });
    });
  });
});

// =====================================================
// CREATE ORDER
// =====================================================

router.post("/", (req, res) => {
  const { user_id, total_amount, items } = req.body;

  if (
    !user_id ||
    !total_amount ||
    !items ||
    !Array.isArray(items) ||
    items.length === 0
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid order data",
    });
  }

  const orderSql = `
        INSERT INTO orders
        (user_id, total_amount, status)
        VALUES (?, ?, 'Pending')
    `;

  db.query(orderSql, [user_id, total_amount], (err, result) => {
    if (err) {
      console.error("Order creation error:", err);

      return res.status(500).json({
        success: false,
        message: "Failed to create order",
      });
    }

    const orderId = result.insertId;

    const itemValues = items.map((item) => [
      orderId,

      item.product_id,

      item.quantity,

      item.price,
    ]);

    const itemSql = `
                INSERT INTO order_items
                (order_id, product_id, quantity, price)
                VALUES ?
            `;

    db.query(itemSql, [itemValues], (itemErr) => {
      if (itemErr) {
        console.error("Order items error:", itemErr);

        return res.status(500).json({
          success: false,
          message: "Failed to save order items",
        });
      }

      res.status(201).json({
        success: true,

        message: "Order created successfully",

        orderId: orderId,
      });
    });
  });
});

// =====================================================
// EXPORT ROUTER
// =====================================================

module.exports = router;
