
const mongoose = require("mongoose");

const registrationSchema = new mongoose.Schema(
  {
    studentName: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    rollNumber: {
      type: String,
      required: true,
      trim: true
    },
    department: {
      type: String,
      required: true
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "Registration",
  registrationSchema
);
