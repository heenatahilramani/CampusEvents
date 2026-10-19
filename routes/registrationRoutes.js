
const express = require("express");
const Registration = require("../models/Registration");
const Event = require("../models/Event");
const verifyAdmin = require("../middleware/authMiddleware");

const router = express.Router();

// Register a student for an event
router.post("/", async (req, res) => {
  try {
    const {
      studentName,
      email,
      rollNumber,
      department,
      event
    } = req.body;

    // Check required fields
    if (
      !studentName?.trim() ||
      !email?.trim() ||
      !rollNumber?.trim() ||
      !department?.trim() ||
      !event
    ) {
      return res.status(400).json({
        message: "All fields are required."
      });
    }

    // Validate email format
    const normalizedEmail = email.trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return res.status(400).json({
        message: "Please enter a valid email address."
      });
    }

    // Check whether the event exists
    const existingEvent = await Event.findById(event);

    if (!existingEvent) {
      return res.status(404).json({
        message: "Event not found."
      });
    }

    // Prevent the same email from registering twice
    const duplicate = await Registration.findOne({
      email: normalizedEmail,
      event
    });

    if (duplicate) {
      return res.status(409).json({
        message: "You have already registered for this event."
      });
    }

    // Check event capacity
    const registrationCount = await Registration.countDocuments({
      event
    });

    if (registrationCount >= existingEvent.capacity) {
      return res.status(409).json({
        message: "Sorry, this event is full."
      });
    }

    // Create registration
    const registration = await Registration.create({
      studentName: studentName.trim(),
      email: normalizedEmail,
      rollNumber: rollNumber.trim(),
      department: department.trim(),
      event
    });

    res.status(201).json({
      message: "Registration successful!",
      registration
    });
  } catch (error) {
    res.status(400).json({
      message: "Registration failed.",
      error: error.message
    });
  }
});

// Get all registrations
router.get("/", verifyAdmin, async (req, res) => {
  try {
    const registrations = await Registration.find()
      .populate("event", "title date venue")
      .sort({ createdAt: -1 });

    res.json(registrations);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch registrations."
    });
  }
});

module.exports = router;
