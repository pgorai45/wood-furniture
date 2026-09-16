const express = require("express");
const router = express.Router();
const db = require("../config/db");
const jwt = require("jsonwebtoken");


// ================= REGISTER USER =================

router.post("/register", (req, res) => {

    const { name, email, password } = req.body;

    if (!name || !email || !password) {

        return res.status(400).json({
            success: false,
            message: "Name, email and password are required"
        });

    }

    const sql = `
        INSERT INTO users (name, email, password)
        VALUES (?, ?, ?)
    `;

    db.query(
        sql,
        [name, email, password],
        (err, result) => {

            if (err) {

                console.error("Register error:", err);

                return res.status(500).json({
                    success: false,
                    message: "Failed to register user"
                });

            }

            res.status(201).json({
                success: true,
                message: "User registered successfully",
                userId: result.insertId
            });

        }
    );

});


// ================= LOGIN USER =================

router.post("/login", (req, res) => {

    const { email, password } = req.body;

    if (!email || !password) {

        return res.status(400).json({
            success: false,
            message: "Email and password are required"
        });

    }

    const sql = `
        SELECT id, name, email, role
        FROM users
        WHERE email = ? AND password = ?
    `;

    db.query(
        sql,
        [email, password],
        (err, results) => {

            if (err) {

                console.error("Login error:", err);

                return res.status(500).json({
                    success: false,
                    message: "Login failed"
                });

            }

            if (results.length === 0) {

                return res.status(401).json({
                    success: false,
                    message: "Invalid email or password"
                });

            }

            const user = results[0];

           const token = jwt.sign(
                {
                    id: user.id,
                    role: user.role
                },
                process.env.JWT_SECRET,
                {
                    expiresIn: "7d"
                }
            );

            res.json({
                success: true,
                message: "Login successful",
                token: token,
                user: user
            });

        }
    );

});


// ================= EXPORT =================

module.exports = router;