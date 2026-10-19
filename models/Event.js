
const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  venue: {
    type: String,
    required: true
  },
  capacity: {
    type: Number,
    required: true,
    min: 1
  }
});

const Event = mongoose.model("Event", eventSchema);

module.exports = Event;
