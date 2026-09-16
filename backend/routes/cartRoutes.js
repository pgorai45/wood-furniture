const express = require("express");
const router = express.Router();

const db = require("../config/db");


// ================= ADD TO CART =================

router.post("/add", (req, res) => {

    const { user_id, product_id, quantity = 1 } = req.body;

    if (!user_id || !product_id) {

        return res.status(400).json({
            success: false,
            message: "user_id and product_id are required"
        });

    }

    const sql = `
        INSERT INTO cart (user_id, product_id, quantity)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE
        quantity = quantity + VALUES(quantity)
    `;

    db.query(
        sql,
        [user_id, product_id, quantity],
        (err, result) => {

            if (err) {

                console.error("Add to cart error:", err);

                return res.status(500).json({
                    success: false,
                    message: "Failed to add product to cart"
                });

            }

            res.status(201).json({

                success: true,
                message: "Product added to cart"

            });

        }
    );

});


module.exports = router;