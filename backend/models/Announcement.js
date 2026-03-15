const mongoose = require("mongoose");

const announcementSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true },
    priority: {
      type: String,
      enum: ["info", "warning", "urgent"],
      default: "info",
    },
    active: { type: Boolean, default: true },
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Announcement", announcementSchema);
