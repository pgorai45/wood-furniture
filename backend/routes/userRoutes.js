const express = require("express");
const router = express.Router();
const db = require("../config/db");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { verifyToken, getJwtSecret } = require("../middleware/authMiddleware");

// Ensure upload directory exists
const avatarUploadDir = path.join(__dirname, "../uploads/avatars");
if (!fs.existsSync(avatarUploadDir)) {
  fs.mkdirSync(avatarUploadDir, { recursive: true });
}

const crypto = require("crypto");

// Multer storage config for user avatars
const avatarStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, avatarUploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeExt = ['.jpg', '.jpeg', '.png', '.webp'].includes(ext) ? ext : '.jpg';
    const randomHex = crypto.randomBytes(8).toString('hex');
    const uniqueName = `avatar-${req.user.id}-${Date.now()}-${randomHex}${safeExt}`;
    cb(null, uniqueName);
  },
});

const avatarFileFilter = (req, file, cb) => {
  const allowedExts = ['.jpeg', '.jpg', '.png', '.webp'];
  const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedExts.includes(ext) && allowedMimes.includes(file.mimetype)) {
    return cb(null, true);
  }
  cb(new Error("Invalid file type: Only JPG, PNG, and WEBP image files are allowed."));
};

const uploadAvatar = multer({
  storage: avatarStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: avatarFileFilter,
});

const bcrypt = require("bcryptjs");

// ================= REGISTER USER =================

router.post("/register", async (req, res) => {
  const { name, email, password, phone, otp, dob, gender, address } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "Name, email and password are required",
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      message: "Password must be at least 6 characters long",
    });
  }

  let formattedPhone = null;
  if (phone && String(phone).trim()) {
    const digits = String(phone).replace(/\D/g, '').slice(-10);
    formattedPhone = digits.length === 10 ? `+91${digits}` : String(phone).trim();

    // If OTP is provided, verify it before creating account
    if (otp) {
      const otpVerify = await verifyMsg91Otp(digits, String(otp).trim(), 'signup');
      if (!otpVerify.success) {
        return res.status(400).json({
          success: false,
          message: otpVerify.message || 'Invalid or expired OTP code',
        });
      }
    }
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = `
      INSERT INTO users (name, email, password, phone, dob, gender, address)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
      sql,
      [
        name.trim(),
        email.trim().toLowerCase(),
        hashedPassword,
        formattedPhone,
        dob || null,
        gender || 'Male',
        address || null,
      ],
      (err, result) => {
        if (err) {
          console.error("Register error:", err);
          if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({
              success: false,
              message: "An account with this email already exists",
            });
          }
          return res.status(500).json({
            success: false,
            message: "Failed to register user",
          });
        }

        res.status(201).json({
          success: true,
          message: "User registered successfully",
          userId: result.insertId,
        });
      }
    );
  } catch (hashErr) {
    console.error("Password hash error:", hashErr);
    res.status(500).json({
      success: false,
      message: "Server error creating user account",
    });
  }
});

// ================= LOGIN USER =================

router.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email and password are required",
    });
  }

  const normalizedEmail = email.trim().toLowerCase();

  const sql = `
    SELECT id, name, email, password, role, phone, dob, gender, address, avatar, created_at
    FROM users
    WHERE email = ?
    LIMIT 1
  `;

  db.query(sql, [normalizedEmail], async (err, results) => {
    if (err) {
      console.error("Login error:", err);
      return res.status(500).json({
        success: false,
        message: "Login failed",
      });
    }

    if (!results || results.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const user = results[0];
    let passwordMatch = false;

    // Check bcrypt hash vs legacy plaintext
    if (user.password && (user.password.startsWith('$2a$') || user.password.startsWith('$2b$') || user.password.startsWith('$2y$'))) {
      passwordMatch = await bcrypt.compare(password, user.password);
    } else {
      passwordMatch = (password === user.password);
      if (passwordMatch) {
        // Transparently upgrade legacy plaintext password to secure bcrypt hash
        try {
          const upgradedHash = await bcrypt.hash(password, 10);
          db.query('UPDATE users SET password = ? WHERE id = ?', [upgradedHash, user.id]);
        } catch (upgradeErr) {
          console.warn("Notice: could not auto-upgrade password hash:", upgradeErr.message);
        }
      }
    }

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Do NOT expose password hash to frontend
    delete user.password;

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
      },
      getJwtSecret(),
      {
        expiresIn: "7d",
      }
    );

    res.json({
      success: true,
      message: "Login successful",
      token: token,
      user: user,
    });
  });
});

const { sendMsg91Otp, verifyMsg91Otp } = require("../services/msg91Service");

// Rate limit cooldown map (phone -> nextAllowedTimestamp)
const resendCooldownMap = new Map();

// ================= SEND OTP FOR MOBILE LOGIN (MSG91) =================

router.post("/send-otp", (req, res) => {
  const { phone } = req.body;

  if (!phone) {
    return res.status(400).json({
      success: false,
      message: "Mobile number is required",
    });
  }

  // Sanitize phone number (strip non-digits)
  const cleanedPhone = phone.replace(/\D/g, '').slice(-10);

  if (!/^[6-9]\d{9}$/.test(cleanedPhone)) {
    return res.status(400).json({
      success: false,
      message: "Please provide a valid 10-digit Indian mobile number",
    });
  }

  // 1. Verify that this mobile number is registered in the database
  const checkSql = `
    SELECT id, name, email, phone FROM users
    WHERE phone = ? OR phone LIKE ? OR phone LIKE ?
    LIMIT 1
  `;

  db.query(checkSql, [cleanedPhone, `%${cleanedPhone}%`, `+91${cleanedPhone}`], async (err, results) => {
    if (err) {
      console.error("DB error checking mobile number:", err);
      return res.status(500).json({
        success: false,
        message: "Database error verifying mobile number",
      });
    }

    if (!results || results.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Mobile number +91 ${cleanedPhone} is not registered. Please create an account first.`,
      });
    }

    // 2. Check Resend Cooldown (30 seconds)
    const cooldownUntil = resendCooldownMap.get(cleanedPhone);
    if (cooldownUntil && Date.now() < cooldownUntil) {
      const waitSeconds = Math.ceil((cooldownUntil - Date.now()) / 1000);
      return res.status(429).json({
        success: false,
        message: `Please wait ${waitSeconds} seconds before requesting another OTP.`,
      });
    }

    // 3. Send OTP via MSG91
    try {
      const msg91Result = await sendMsg91Otp(cleanedPhone);

      if (!msg91Result.success) {
        return res.status(400).json({
          success: false,
          message: msg91Result.message || "Failed to send OTP via SMS provider",
        });
      }

      // Set 30 second cooldown
      resendCooldownMap.set(cleanedPhone, Date.now() + 30000);

      res.json({
        success: true,
        message: `OTP sent successfully to +91 ${cleanedPhone}`,
      });
    } catch (sendErr) {
      console.error("Error sending MSG91 OTP:", sendErr.message);
      res.status(500).json({
        success: false,
        message: "Error sending OTP SMS. Please try again later.",
      });
    }
  });
});

// ================= VERIFY OTP & LOGIN (MSG91) =================

router.post("/verify-otp", async (req, res) => {
  const { phone, otp } = req.body;

  if (!phone || !otp) {
    return res.status(400).json({
      success: false,
      message: "Mobile number and OTP code are required",
    });
  }

  const cleanedPhone = phone.replace(/\D/g, '').slice(-10);

  if (!/^[6-9]\d{9}$/.test(cleanedPhone)) {
    return res.status(400).json({
      success: false,
      message: "Please provide a valid 10-digit Indian mobile number",
    });
  }

  // 1. Verify OTP with MSG91
  try {
    const verifyResult = await verifyMsg91Otp(cleanedPhone, otp.trim());

    if (!verifyResult.success) {
      return res.status(400).json({
        success: false,
        message: verifyResult.message || "Invalid or expired OTP code. Please try again.",
      });
    }

    // 2. Fetch authenticated user from database
    const checkSql = `
      SELECT id, name, email, role, phone, dob, gender, address, avatar, created_at
      FROM users
      WHERE phone = ? OR phone LIKE ? OR phone LIKE ?
      LIMIT 1
    `;

    db.query(checkSql, [cleanedPhone, `%${cleanedPhone}%`, `+91${cleanedPhone}`], (err, results) => {
      if (err) {
        console.error("OTP verification DB error:", err);
        return res.status(500).json({
          success: false,
          message: "Database error fetching user profile",
        });
      }

      if (!results || results.length === 0) {
        return res.status(404).json({
          success: false,
          message: `This mobile number (+91 ${cleanedPhone}) is not registered. Please create an account first.`,
        });
      }

      const user = results[0];
      delete user.password;

      const token = jwt.sign(
        { id: user.id, role: user.role },
        getJwtSecret(),
        { expiresIn: "7d" }
      );

      res.json({
        success: true,
        message: "Login successful",
        token: token,
        user: user,
      });
    });
  } catch (verifyErr) {
    console.error("Error during OTP verification:", verifyErr.message);
    res.status(500).json({
      success: false,
      message: "Server error verifying OTP. Please try again.",
    });
  }
});

// ================= GET AUTHENTICATED USER PROFILE =================

router.get("/profile", verifyToken, (req, res) => {
  const userId = req.user.id;

  const userSql = `
    SELECT id, name, email, role, phone, dob, gender, address, avatar, created_at
    FROM users
    WHERE id = ?
  `;

  db.query(userSql, [userId], (err, results) => {
    if (err || results.length === 0) {
      console.error("Profile fetch error:", err);
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const user = results[0];

    // Fetch user order count
    const orderCountSql = `SELECT COUNT(*) AS total_orders FROM orders WHERE user_id = ?`;

    db.query(orderCountSql, [userId], (orderErr, orderResults) => {
      const totalOrders = orderResults && orderResults[0] ? orderResults[0].total_orders : 0;

      // Calculate dynamic profile completion percentage
      let score = 0;
      if (user.name) score += 20;
      if (user.email) score += 20;
      if (user.phone) score += 20;
      if (user.dob) score += 15;
      if (user.gender) score += 10;
      if (user.address) score += 15;
      const profileStrength = Math.min(score, 100);

      const savedAddressesCount = user.address && user.address.trim().length > 0 ? 1 : 0;

      res.json({
        success: true,
        user: user,
        stats: {
          totalOrders: totalOrders,
          profileStrength: profileStrength,
          savedAddressesCount: savedAddressesCount,
          memberSince: user.created_at,
        },
      });
    });
  });
});

// ================= UPLOAD PROFILE AVATAR =================

router.post("/avatar", verifyToken, (req, res) => {
  uploadAvatar.single("avatar")(req, res, (err) => {
    if (err) {
      console.error("Avatar upload multer error:", err);
      return res.status(400).json({
        success: false,
        message: err.message || "Failed to upload image file",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image file provided. Please choose a JPG, PNG, or WEBP image.",
      });
    }

    const userId = req.user.id;
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;

    const updateSql = `UPDATE users SET avatar = ? WHERE id = ?`;

    db.query(updateSql, [avatarUrl, userId], (dbErr) => {
      if (dbErr) {
        console.error("Avatar update error in MySQL:", dbErr);
        return res.status(500).json({
          success: false,
          message: "Database error updating user avatar",
        });
      }

      // Fetch updated user from database
      const fetchSql = `
        SELECT id, name, email, role, phone, dob, gender, address, avatar, created_at
        FROM users
        WHERE id = ?
      `;

      db.query(fetchSql, [userId], (fetchErr, results) => {
        if (fetchErr || results.length === 0) {
          return res.json({
            success: true,
            message: "Profile image uploaded successfully",
            avatar: avatarUrl,
          });
        }

        const safeUser = results[0];
        delete safeUser.password;

        res.json({
          success: true,
          message: "Profile image updated successfully",
          avatar: avatarUrl,
          user: safeUser,
        });
      });
    });
  });
});

// ================= UPDATE AUTHENTICATED USER PROFILE =================

router.put("/profile", verifyToken, (req, res) => {
  const userId = req.user.id;
  const { name, phone, dob, gender, address, avatar } = req.body;

  if (!name || name.trim() === '') {
    return res.status(400).json({
      success: false,
      message: "Full name is required",
    });
  }

  let formattedPhone = null;
  if (phone !== undefined && phone !== null && String(phone).trim() !== '') {
    const digits = String(phone).replace(/\D/g, '').slice(-10);
    formattedPhone = digits.length === 10 ? `+91${digits}` : String(phone).trim();
  }

  const updateSql = `
    UPDATE users
    SET 
      name = COALESCE(?, name),
      phone = COALESCE(?, phone),
      dob = COALESCE(?, dob),
      gender = COALESCE(?, gender),
      address = COALESCE(?, address),
      avatar = COALESCE(?, avatar)
    WHERE id = ?
  `;

  db.query(
    updateSql,
    [
      name ? name.trim() : null,
      formattedPhone,
      dob !== undefined ? (dob ? String(dob).trim() : null) : null,
      gender || null,
      address !== undefined ? (address ? String(address).trim() : null) : null,
      avatar !== undefined ? (avatar ? String(avatar).trim() : null) : null,
      userId,
    ],
    (err) => {
      if (err) {
        console.error("Profile update error:", err);
        return res.status(500).json({
          success: false,
          message: "Failed to update profile",
        });
      }

      // Fetch fresh updated user data
      const fetchSql = `
        SELECT id, name, email, role, phone, dob, gender, address, avatar, created_at
        FROM users
        WHERE id = ?
      `;

      db.query(fetchSql, [userId], (fetchErr, results) => {
        if (fetchErr || results.length === 0) {
          return res.json({
            success: true,
            message: "Profile updated successfully",
          });
        }

        const safeUser = results[0];
        delete safeUser.password;

        res.json({
          success: true,
          message: "Profile updated successfully",
          user: safeUser,
        });
      });
    }
  );
});

// ================= CHANGE PASSWORD =================

router.put("/change-password", verifyToken, (req, res) => {
  const userId = req.user.id;
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      success: false,
      message: "Current password and new password are required",
    });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({
      success: false,
      message: "New password must be at least 6 characters long",
    });
  }

  const checkSql = `SELECT password FROM users WHERE id = ?`;

  db.query(checkSql, [userId], async (err, results) => {
    if (err || results.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const currentHash = results[0].password;
    let isCurrentMatch = false;

    if (currentHash && (currentHash.startsWith('$2a$') || currentHash.startsWith('$2b$') || currentHash.startsWith('$2y$'))) {
      isCurrentMatch = await bcrypt.compare(currentPassword, currentHash);
    } else {
      isCurrentMatch = (currentHash === currentPassword);
    }

    if (!isCurrentMatch) {
      return res.status(400).json({
        success: false,
        message: "Incorrect current password",
      });
    }

    try {
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);
      const updatePassSql = `UPDATE users SET password = ? WHERE id = ?`;

      db.query(updatePassSql, [hashedNewPassword, userId], (updateErr) => {
        if (updateErr) {
          console.error("Password update error:", updateErr);
          return res.status(500).json({
            success: false,
            message: "Failed to update password",
          });
        }

        res.json({
          success: true,
          message: "Password changed successfully",
        });
      });
    } catch (hashErr) {
      console.error("Password hash error:", hashErr);
      res.status(500).json({
        success: false,
        message: "Server error encrypting new password",
      });
    }
  });
});

module.exports = router;