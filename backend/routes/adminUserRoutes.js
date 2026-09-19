const express = require("express");
const router = express.Router();

const db = require("../config/db");

const {
    verifyToken,
    adminOnly
} = require("../middleware/authMiddleware");


// ================= GET ALL USERS (ONLY CUSTOMERS / ROLE='user') =================

router.get("/", verifyToken, adminOnly, (req, res) => {

    const sql = `
        SELECT
            id,
            name,
            email,
            created_at,
            role
        FROM users
        WHERE role = 'user'
        ORDER BY id DESC
    `;

    db.query(sql, (err, results) => {

        if (err) {

            console.error(
                "Admin users fetch error:",
                err
            );

            return res.status(500).json({
                success: false,
                message: "Failed to fetch users"
            });

        }

        res.json({
            success: true,
            users: results
        });

    });

});


module.exports = router;