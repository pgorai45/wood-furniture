const express = require('express');
const router = express.Router();
const db = require('../config/db');
const jwt = require('jsonwebtoken');
const { sendMsg91Otp, resendMsg91Otp, verifyMsg91Otp } = require('../services/msg91Service');
const { getJwtSecret } = require('../middleware/authMiddleware');

// Rate-limiting cooldown map (phone -> nextAllowedTimestamp)
const resendCooldownMap = new Map();

// Helper to normalize and validate 10-digit Indian mobile number
const parseAndValidateIndianPhone = (phoneStr) => {
  if (!phoneStr) return null;
  const digits = String(phoneStr).replace(/\D/g, '').slice(-10);
  if (/^[6-9]\d{9}$/.test(digits)) {
    return digits;
  }
  return null;
};

// ================= POST /api/auth/send-otp =================

router.post('/send-otp', (req, res) => {
  const phone = req.body.phone || req.body.mobile;
  const purpose = req.body.purpose || req.body.type || 'login'; // 'login' | 'signup'

  if (!phone) {
    return res.status(400).json({
      success: false,
      message: 'Mobile number is required',
    });
  }

  const cleanedPhone = parseAndValidateIndianPhone(phone);
  if (!cleanedPhone) {
    return res.status(400).json({
      success: false,
      message: 'Please enter a valid 10-digit Indian mobile number (starts with 6, 7, 8, or 9)',
    });
  }

  // 1. Check user existence based on purpose
  const checkSql = `
    SELECT id, name, email, phone FROM users
    WHERE phone = ? OR phone LIKE ? OR phone LIKE ?
    LIMIT 1
  `;

  db.query(checkSql, [cleanedPhone, `%${cleanedPhone}%`, `+91${cleanedPhone}`], async (err, results) => {
    if (err) {
      console.error('Database error checking mobile number:', err);
      return res.status(500).json({
        success: false,
        message: 'Database error verifying mobile number',
      });
    }

    if (purpose === 'signup') {
      if (results && results.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Mobile number +91 ${cleanedPhone} is already registered. Please login instead.`,
        });
      }
    } else {
      // Purpose is 'login'
      if (!results || results.length === 0) {
        return res.status(404).json({
          success: false,
          message: `Mobile number +91 ${cleanedPhone} is not registered. Please create an account first.`,
        });
      }
    }

    // 2. Check 30-second rate-limiting cooldown
    const cooldownUntil = resendCooldownMap.get(cleanedPhone);
    if (cooldownUntil && Date.now() < cooldownUntil) {
      const waitSeconds = Math.ceil((cooldownUntil - Date.now()) / 1000);
      return res.status(429).json({
        success: false,
        message: `Please wait ${waitSeconds} seconds before requesting another OTP.`,
      });
    }

    // 3. Dispatch OTP via Dual Mode Service
    try {
      const otpRes = await sendMsg91Otp(cleanedPhone, purpose);
      if (!otpRes.success) {
        return res.status(400).json({
          success: false,
          message: otpRes.message || 'Failed to send OTP',
        });
      }

      // Set 30 second cooldown
      resendCooldownMap.set(cleanedPhone, Date.now() + 30000);

      res.json({
        success: true,
        message: otpRes.message,
        isDemoMode: otpRes.isDemoMode,
        demoOtp: otpRes.demoOtp,
      });
    } catch (sendErr) {
      console.error('Error sending OTP:', sendErr.message);
      res.status(500).json({
        success: false,
        message: 'Error sending OTP. Please try again.',
      });
    }
  });
});

// ================= POST /api/auth/resend-otp =================

router.post('/resend-otp', async (req, res) => {
  const phone = req.body.phone || req.body.mobile;
  const purpose = req.body.purpose || req.body.type || 'login';

  if (!phone) {
    return res.status(400).json({
      success: false,
      message: 'Mobile number is required',
    });
  }

  const cleanedPhone = parseAndValidateIndianPhone(phone);
  if (!cleanedPhone) {
    return res.status(400).json({
      success: false,
      message: 'Please enter a valid 10-digit Indian mobile number',
    });
  }

  // Check cooldown
  const cooldownUntil = resendCooldownMap.get(cleanedPhone);
  if (cooldownUntil && Date.now() < cooldownUntil) {
    const waitSeconds = Math.ceil((cooldownUntil - Date.now()) / 1000);
    return res.status(429).json({
      success: false,
      message: `Please wait ${waitSeconds} seconds before resending OTP.`,
    });
  }

  try {
    const otpRes = await resendMsg91Otp(cleanedPhone, purpose);
    if (!otpRes.success) {
      return res.status(400).json({
        success: false,
        message: otpRes.message || 'Failed to resend OTP',
      });
    }

    resendCooldownMap.set(cleanedPhone, Date.now() + 30000);

    res.json({
      success: true,
      message: otpRes.message,
      isDemoMode: otpRes.isDemoMode,
      demoOtp: otpRes.demoOtp,
    });
  } catch (err) {
    console.error('Resend OTP error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Failed to resend OTP. Please try again.',
    });
  }
});

// ================= POST /api/auth/verify-otp =================

router.post('/verify-otp', async (req, res) => {
  const phone = req.body.phone || req.body.mobile;
  const otp = req.body.otp || req.body.code;
  const purpose = req.body.purpose || req.body.type || 'login';

  if (!phone || !otp) {
    return res.status(400).json({
      success: false,
      message: 'Mobile number and OTP code are required',
    });
  }

  const cleanedPhone = parseAndValidateIndianPhone(phone);
  if (!cleanedPhone) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a valid 10-digit Indian mobile number',
    });
  }

  // 1. Verify OTP with Dual Mode Service
  try {
    const verifyResult = await verifyMsg91Otp(cleanedPhone, String(otp).trim(), purpose);
    if (!verifyResult.success) {
      return res.status(400).json({
        success: false,
        message: verifyResult.message || 'Invalid or expired OTP code.',
      });
    }

    // If purpose is 'signup', verification is complete
    if (purpose === 'signup') {
      return res.json({
        success: true,
        message: 'Mobile number verified successfully',
      });
    }

    // 2. Purpose is 'login': Fetch authenticated user from users table
    const checkSql = `
      SELECT id, name, email, role, phone, dob, gender, address, avatar, created_at
      FROM users
      WHERE phone = ? OR phone LIKE ? OR phone LIKE ?
      LIMIT 1
    `;

    db.query(checkSql, [cleanedPhone, `%${cleanedPhone}%`, `+91${cleanedPhone}`], (err, results) => {
      if (err) {
        console.error('OTP verification database error:', err);
        return res.status(500).json({
          success: false,
          message: 'Database error fetching user account',
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
        { expiresIn: '7d' }
      );

      res.json({
        success: true,
        message: 'Login successful',
        token: token,
        user: user,
      });
    });
  } catch (verifyErr) {
    console.error('Error during OTP verification:', verifyErr.message);
    res.status(500).json({
      success: false,
      message: 'Server error verifying OTP. Please try again.',
    });
  }
});

// Used reset tokens in memory to enforce single-use reset links
const usedResetTokens = new Set();
const bcrypt = require('bcryptjs');

// ================= POST /api/auth/forgot-password =================

router.post('/forgot-password', (req, res) => {
  const { email } = req.body;

  if (!email || !email.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Please provide your registered email address.',
    });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(normalizedEmail)) {
    return res.status(400).json({
      success: false,
      message: 'Please enter a valid email address format.',
    });
  }

  const sql = 'SELECT id, name, email FROM users WHERE email = ? LIMIT 1';
  db.query(sql, [normalizedEmail], (err, results) => {
    if (err) {
      console.error('Forgot password database error:', err);
      return res.status(500).json({
        success: false,
        message: 'Database error checking email address.',
      });
    }

    if (!results || results.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this email address.',
      });
    }

    const user = results[0];
    const resetToken = jwt.sign(
      { id: user.id, email: user.email, purpose: 'pwd_reset' },
      getJwtSecret(),
      { expiresIn: '15m' }
    );

    const resetLink = `http://localhost:5173/reset-password?token=${encodeURIComponent(resetToken)}`;

    console.log(`[Demo Forgot Password] Demo Reset Link generated for ${user.email}`);

    return res.json({
      success: true,
      message: 'Demo Reset Link Generated',
      isDemoMode: true,
      resetToken: resetToken,
      resetLink: resetLink,
      email: user.email,
    });
  });
});

// ================= POST /api/auth/verify-reset-token =================

router.post('/verify-reset-token', (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({
      success: false,
      message: 'Reset token is required.',
    });
  }

  if (usedResetTokens.has(token)) {
    return res.status(400).json({
      success: false,
      message: 'This reset token has already been used. Please request a new one.',
    });
  }

  try {
    const decoded = jwt.verify(token, getJwtSecret());

    if (decoded.purpose !== 'pwd_reset') {
      return res.status(400).json({
        success: false,
        message: 'Invalid reset token purpose.',
      });
    }

    res.json({
      success: true,
      message: 'Reset token is valid',
      email: decoded.email,
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: 'Reset token is invalid or has expired (valid for 15 minutes). Please request a new one.',
    });
  }
});

// ================= POST /api/auth/reset-password =================

router.post('/reset-password', async (req, res) => {
  const { token, newPassword, confirmPassword, email } = req.body;

  if (!token) {
    return res.status(400).json({
      success: false,
      message: 'Reset token is required.',
    });
  }

  if (!newPassword || !confirmPassword) {
    return res.status(400).json({
      success: false,
      message: 'Please provide both new password and confirm password.',
    });
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).json({
      success: false,
      message: 'Passwords do not match.',
    });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'New password must be at least 6 characters long.',
    });
  }

  if (usedResetTokens.has(token)) {
    return res.status(400).json({
      success: false,
      message: 'This reset token has already been used. Please request a new reset link.',
    });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, getJwtSecret());

    if (decoded.purpose !== 'pwd_reset') {
      return res.status(400).json({
        success: false,
        message: 'Invalid reset token purpose.',
      });
    }
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: 'Reset token is invalid or has expired. Please request a new reset link.',
    });
  }

  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const updateSql = 'UPDATE users SET password = ? WHERE id = ? OR email = ?';

    db.query(updateSql, [hashedPassword, decoded.id, decoded.email], (updateErr) => {
      if (updateErr) {
        console.error('Password reset update error in MySQL:', updateErr);
        return res.status(500).json({
          success: false,
          message: 'Database error updating password.',
        });
      }

      // Mark token as single-use consumed
      usedResetTokens.add(token);

      res.json({
        success: true,
        message: 'Password has been reset successfully! Please login with your new password.',
      });
    });
  } catch (hashErr) {
    console.error('Password encryption error:', hashErr);
    res.status(500).json({
      success: false,
      message: 'Server error encrypting new password.',
    });
  }
});

module.exports = router;
