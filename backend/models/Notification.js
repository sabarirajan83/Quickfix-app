const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ["ticket_update", "new_ticket", "assignment", "announcement"],
      default: "ticket_update",
    },
    read: { type: Boolean, default: false },
    ticketId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ticket",
      default: null,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Notification", notificationSchema);
