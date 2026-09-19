const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { verifyToken } = require("../middleware/authMiddleware");

// =====================================================
// GET CURRENT AUTHENTICATED USER'S ORDERS
// =====================================================

router.get("/my-orders", verifyToken, (req, res) => {
  const userId = req.user.id;

  const sql = `
    SELECT 
      o.id,
      o.user_id,
      o.total_amount,
      o.status,
      o.shipping_name,
      o.shipping_phone,
      o.shipping_address,
      o.payment_method,
      o.created_at,
      COUNT(oi.id) AS total_items
    FROM orders o
    LEFT JOIN order_items oi ON o.id = oi.order_id
    WHERE o.user_id = ?
    GROUP BY o.id
    ORDER BY o.created_at DESC
  `;

  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error("Fetch user orders error:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch orders",
      });
    }

    // Format for frontend compatibility
    const formattedOrders = results.map((ord) => ({
      ...ord,
      order_status: ord.status, // alias for frontend UI compatibility
      total_price: ord.total_amount,
    }));

    res.json({
      success: true,
      orders: formattedOrders,
    });
  });
});

// =====================================================
// GET SPECIFIC ORDER DETAILS (USER-ISOLATED)
// =====================================================

router.get("/:id", verifyToken, (req, res) => {
  const userId = req.user.id;
  const orderId = req.params.id;

  const orderSql = `
    SELECT * FROM orders
    WHERE id = ? AND (user_id = ? OR ? = 'admin')
    LIMIT 1
  `;

  db.query(orderSql, [orderId, userId, req.user.role || 'user'], (err, orderResults) => {
    if (err) {
      console.error("Fetch order error:", err);
      return res.status(500).json({
        success: false,
        message: "Database error fetching order",
      });
    }

    if (!orderResults || orderResults.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Order not found or access denied",
      });
    }

    const order = orderResults[0];

    const itemsSql = `
      SELECT 
        oi.id,
        oi.order_id,
        oi.product_id,
        oi.quantity,
        oi.price,
        p.name AS product_name,
        p.image,
        p.category
      FROM order_items oi
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ?
    `;

    db.query(itemsSql, [orderId], (itemsErr, items) => {
      if (itemsErr) {
        console.error("Fetch order items error:", itemsErr);
        return res.status(500).json({
          success: false,
          message: "Failed to fetch order items",
        });
      }

      res.json({
        success: true,
        order: {
          ...order,
          order_status: order.status,
          items: items || [],
        },
      });
    });
  });
});

// =====================================================
// SECURE CHECKOUT & ORDER CREATION
// =====================================================

router.post("/checkout", verifyToken, (req, res) => {
  const userId = req.user.id;
  const { items, shipping_name, shipping_phone, shipping_address, payment_method } = req.body;

  // 1. Validate cart items array
  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Your cart is empty. Please add items before checking out.",
    });
  }

  // 2. Fetch user details to validate/fill shipping info
  const userSql = "SELECT id, name, email, phone, address FROM users WHERE id = ? LIMIT 1";
  db.query(userSql, [userId], (userErr, userResults) => {
    if (userErr || !userResults || userResults.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Authenticated user not found",
      });
    }

    const user = userResults[0];
    const finalShippingName = (shipping_name || user.name || "Customer").trim();
    const finalShippingPhone = (shipping_phone || user.phone || "").trim();
    const finalShippingAddress = (shipping_address || user.address || "").trim();
    const finalPaymentMethod = payment_method || "Cash on Delivery";

    if (!finalShippingAddress) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid shipping address for delivery.",
      });
    }

    if (!finalShippingPhone) {
      return res.status(400).json({
        success: false,
        message: "Please provide a contact mobile number for shipping.",
      });
    }

    // 3. Extract and validate product IDs
    const productIds = items
      .map((item) => Number(item.product_id || item.id))
      .filter((id) => !isNaN(id) && id > 0);

    if (productIds.length !== items.length) {
      return res.status(400).json({
        success: false,
        message: "Invalid product IDs in cart.",
      });
    }

    const placeholders = productIds.map(() => "?").join(",");

    // 4. Fetch real product prices and available stock from MySQL
    const productSql = `
      SELECT id, name, price, stock
      FROM products
      WHERE id IN (${placeholders})
    `;

    db.query(productSql, productIds, (productErr, products) => {
      if (productErr) {
        console.error("Product fetch error:", productErr);
        return res.status(500).json({
          success: false,
          message: "Failed to verify product availability.",
        });
      }

      if (!products || products.length !== productIds.length) {
        return res.status(400).json({
          success: false,
          message: "One or more products in your cart are no longer available in our catalogue.",
        });
      }

      // 5. Stock Validation & Server-side Total Calculation
      let subtotal = 0;
      const validatedItems = [];

      for (const item of items) {
        const pId = Number(item.product_id || item.id);
        const qty = Number(item.quantity || item.qty) || 1;

        if (qty <= 0) {
          return res.status(400).json({
            success: false,
            message: "Item quantity must be at least 1.",
          });
        }

        const product = products.find((p) => Number(p.id) === pId);
        if (!product) {
          return res.status(400).json({
            success: false,
            message: `Product ID #${pId} not found.`,
          });
        }

        const currentStock = Number(product.stock !== undefined && product.stock !== null ? product.stock : 50);

        if (currentStock <= 0) {
          return res.status(400).json({
            success: false,
            message: `Sorry, "${product.name}" is currently out of stock.`,
          });
        }

        if (qty > currentStock) {
          return res.status(400).json({
            success: false,
            message: `Insufficient stock for "${product.name}". Available stock: ${currentStock}, requested: ${qty}.`,
          });
        }

        const unitPrice = Number(product.price);
        subtotal += unitPrice * qty;

        validatedItems.push({
          product_id: pId,
          name: product.name,
          quantity: qty,
          price: unitPrice,
        });
      }

      // 6. Calculate discounts and taxes securely
      // 10% discount for subtotal >= ₹50,000
      const discount = subtotal >= 50000 ? Math.round(subtotal * 0.1) : 0;
      const taxableAmount = subtotal - discount;
      const gst = Math.round(taxableAmount * 0.18);
      const totalAmount = taxableAmount + gst;

      // 7. Insert into orders table
      const orderSql = `
        INSERT INTO orders
        (user_id, total_amount, status, shipping_name, shipping_phone, shipping_address, payment_method)
        VALUES (?, ?, 'Pending', ?, ?, ?, ?)
      `;

      db.query(
        orderSql,
        [
          userId,
          totalAmount,
          finalShippingName,
          finalShippingPhone,
          finalShippingAddress,
          finalPaymentMethod,
        ],
        (orderErr, orderResult) => {
          if (orderErr) {
            console.error("Order creation error:", orderErr);
            return res.status(500).json({
              success: false,
              message: "Failed to create order in database.",
            });
          }

          const orderId = orderResult.insertId;

          // 8. Insert order items
          const itemValues = validatedItems.map((item) => [
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
              console.error("Order items insert error:", itemErr);
              return res.status(500).json({
                success: false,
                message: "Failed to save order line items.",
              });
            }

            // 9. Reduce product stock for each ordered item
            validatedItems.forEach((item) => {
              const deductStockSql = `
                UPDATE products
                SET stock = GREATEST(0, stock - ?)
                WHERE id = ?
              `;
              db.query(deductStockSql, [item.quantity, item.product_id], (stockErr) => {
                if (stockErr) {
                  console.error(`Stock update error for product #${item.product_id}:`, stockErr);
                }
              });
            });

            // 10. Clear this user's cart in MySQL
            db.query("DELETE FROM cart WHERE user_id = ?", [userId], (cartErr) => {
              if (cartErr) {
                console.warn("Cart cleanup notice:", cartErr.message);
              }
            });

            // Also update user's saved address in profile if they had none
            if (!user.address && finalShippingAddress) {
              db.query(
                "UPDATE users SET address = ? WHERE id = ?",
                [finalShippingAddress, userId],
                () => {}
              );
            }

            console.log(`[Order Placed] Order #${orderId} created by User #${userId} (Total: ₹${totalAmount})`);

            // 11. Return detailed success response
            res.status(201).json({
              success: true,
              message: "Order placed successfully!",
              orderId: orderId,
              subtotal: subtotal,
              discount: discount,
              gst: gst,
              totalAmount: totalAmount,
              shipping_name: finalShippingName,
              shipping_phone: finalShippingPhone,
              shipping_address: finalShippingAddress,
              payment_method: finalPaymentMethod,
              status: "Pending",
              items: validatedItems,
            });
          }
        );
      }
    );
  });
});
});

module.exports = router;
