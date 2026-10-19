
const express = require("express");
const crypto = require("crypto");
const rateLimit = require("express-rate-limit");
const jwt = require("jsonwebtoken");

const Registration = require("../models/Registration");
const EmailOTP = require("../models/EmailOTP");
const sendEmail = require("../utils/sendEmail");

const router = express.Router();

const requestLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    message: "Too many requests. Please try again later."
  }
});

const verifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    message: "Too many verification attempts. Please try again later."
  }
});

// Request an email verification code
router.post("/request-otp", requestLimiter, async (req, res) => {
  try {
    const email =
      typeof req.body.email === "string"
        ? req.body.email.trim().toLowerCase()
        : "";

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        message: "Please provide a valid email address."
      });
    }

    // Use the same response whether or not registrations exist.
    const responseMessage =
      "If this email has registrations, a verification code will be sent.";

    const hasRegistration = await Registration.exists({ email });

    if (!hasRegistration) {
      return res.json({ message: responseMessage });
    }

    // Replace any previous code for this email.
    await EmailOTP.deleteMany({ email });

    const otp = crypto.randomInt(100000, 1000000).toString();

    // Hash the OTP instead of storing it in plain text.
    const otpHash = crypto
      .createHmac("sha256", process.env.JWT_SECRET)
      .update(otp)
      .digest("hex");

    await EmailOTP.create({
      email,
      otpHash,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      attempts: 0
    });

    try {
      await sendEmail(
        email,
        "Your CampusEvents verification code",
        `Your verification code is ${otp}. It expires in 5 minutes. Do not share this code with anyone.`
      );
    } catch (error) {
      await EmailOTP.deleteMany({ email });
      throw error;
    }

    return res.json({ message: responseMessage });
  } catch (error) {
    console.error("OTP request failed:", error.message);

    return res.status(500).json({
      message: "Unable to process the request right now."
    });
  }
});

// Verify the code and issue a short-lived student access token
router.post("/verify-otp", verifyLimiter, async (req, res) => {
  try {
    const email =
      typeof req.body.email === "string"
        ? req.body.email.trim().toLowerCase()
        : "";

    const otp =
      typeof req.body.otp === "string" ? req.body.otp.trim() : "";

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      !/^\d{6}$/.test(otp)
    ) {
      return res.status(400).json({
        message: "Enter a valid email and six-digit code."
      });
    }

    const record = await EmailOTP.findOne({ email });

    if (!record || record.expiresAt <= new Date()) {
      return res.status(401).json({
        message: "Invalid or expired code. Request a new one."
      });
    }

    if (record.attempts >= 5) {
      await EmailOTP.deleteMany({ email });

      return res.status(429).json({
        message: "Too many incorrect attempts. Request a new code."
      });
    }

    const submittedHash = crypto
      .createHmac("sha256", process.env.JWT_SECRET)
      .update(otp)
      .digest("hex");

    const submittedBuffer = Buffer.from(submittedHash, "hex");
    const savedBuffer = Buffer.from(record.otpHash, "hex");

    const matches =
      submittedBuffer.length === savedBuffer.length &&
      crypto.timingSafeEqual(submittedBuffer, savedBuffer);

    if (!matches) {
      record.attempts += 1;

      if (record.attempts >= 5) {
        await EmailOTP.deleteMany({ email });
      } else {
        await record.save();
      }

      return res.status(401).json({
        message: "Invalid or expired code. Check the code and try again."
      });
    }

    // Confirm the email still has registrations.
    const hasRegistration = await Registration.exists({ email });

    await EmailOTP.deleteMany({ email });

    if (!hasRegistration) {
      return res.status(401).json({
        message: "Verification could not be completed."
      });
    }

    const token = jwt.sign(
      {
        role: "student_verified",
        email
      },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    return res.json({
      message: "Email verified successfully.",
      token
    });
  } catch (error) {
    console.error("OTP verification failed:", error.message);

    return res.status(500).json({
      message: "Unable to verify the code right now."
    });
  }
});

/* Get registrations belonging to the verified student */
router.get("/my-registrations", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Please verify your email first."
      });
    }

    const token = authHeader.split(" ")[1];
    let decoded;

    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(401).json({
        message: "Your access token is invalid or expired. Verify your email again."
      });
    }

    if (decoded.role !== "student_verified" || !decoded.email) {
      return res.status(403).json({
        message: "Student access required."
      });
    }

    const registrations = await Registration.find({
      email: decoded.email
    })
      .populate("event", "title date venue")
      .sort({ createdAt: -1 });

    return res.json(registrations);
  } catch (error) {
    console.error("Failed to fetch student registrations:", error.message);

    return res.status(500).json({
      message: "Failed to fetch registrations."
    });
  }
});

module.exports = router;
