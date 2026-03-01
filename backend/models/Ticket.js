const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    roomNumber: { type: String, required: true },
    category: {
      type: String,
      required: true,
      enum: [
        "Plumbing",
        "Electrical",
        "Carpentry",
        "Cleaning",
        "Internet",
        "Other",
      ],
    },
    description: { type: String, required: true },
    status: {
      type: String,
      enum: ["Pending", "In Progress", "Resolved"],
      default: "Pending",
    },
    resident: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Ticket", ticketSchema);
