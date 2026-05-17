const mongoose = require("mongoose");

const deviceCommandSchema = new mongoose.Schema({
  command: {
    type: String,
    enum: ["ON", "OFF"],
    required: true,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("tropical_DB", deviceCommandSchema);