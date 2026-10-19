
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const verifyAdmin = require("../middleware/authMiddleware");
const router = express.Router();

// Admin login API
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;
    const jwtSecret = process.env.JWT_SECRET;

    if (!adminEmail || !adminPasswordHash || !jwtSecret) {
      return res.status(500).json({
        message: "Admin authentication is not configured."
      });
    }

    if (
      !email ||
      !password ||
      email.trim().toLowerCase() !== adminEmail.trim().toLowerCase()
    ) {
      return res.status(401).json({
        message: "Invalid email or password."
      });
    }

    const passwordMatches = await bcrypt.compare(
      password,
      adminPasswordHash
    );

    if (!passwordMatches) {
      return res.status(401).json({
        message: "Invalid email or password."
      });
    }

    const token = jwt.sign(
      { role: "admin", email: adminEmail },
      jwtSecret,
      { expiresIn: "2h" }
    );

    return res.json({
      message: "Admin login successful.",
      token
    });
  } catch (error) {
    return res.status(500).json({
      message: "Login failed."
    });
  }
});

router.get("/dashboard", verifyAdmin, (req, res) => {
  res.json({
    message: "Welcome to the Admin Dashboard!",
    admin: req.admin.email
  });
});

module.exports = router;
