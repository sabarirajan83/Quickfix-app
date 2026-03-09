const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  text: { type: String, required: true },
  addedBy: { type: String, required: true }, // admin name
  addedAt: { type: Date, default: Date.now },
});

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
    priority: {
      type: String,
      enum: ["Low", "Medium", "High", "Urgent"],
      default: "Medium",
    },
    comments: [commentSchema], // array of admin comments
    resolvedAt: { type: Date, default: null }, // track when resolved
    resident: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Ticket", ticketSchema);
