const express = require("express");
const router = express.Router();

const db = require("../config/db");


// ================= GET ALL PRODUCTS =================

router.get("/", (req, res) => {

    const sql = "SELECT * FROM products ORDER BY id DESC";

    db.query(sql, (err, results) => {

        if (err) {

            console.error("Product fetch error:", err);

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

// ================= ADD PRODUCT =================

router.post("/", (req, res) => {

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
        category
    } = req.body;

    const sql = `
        INSERT INTO products
        (name, image, price, old_price, discount, rating, reviews, colors, delivery, badge, category)
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
        category
    ];

    db.query(sql, values, (err, result) => {

        if (err) {

            console.error("Product insert error:", err);

            return res.status(500).json({
                success: false,
                message: "Failed to add product"
            });

        }

        res.status(201).json({

            success: true,

            message: "Product added successfully",

            productId: result.insertId

        });

    });

});


module.exports = router;