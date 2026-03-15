const express = require("express");
const router = express.Router();
const {
  createTicket,
  getMyTickets,
  getAllTickets,
  getTicketHistory,
  updateTicketStatus,
  addComment,
  getStats,
} = require("../controllers/ticketController");
const { submitRating } = require("../controllers/ratingController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

// Static named routes first
router.get("/stats", protect, adminOnly, getStats);
router.get("/history", protect, adminOnly, getTicketHistory);
router.get("/my", protect, getMyTickets);

// General routes
router.post("/", protect, createTicket);
router.get("/", protect, adminOnly, getAllTickets);

// Dynamic id routes last
router.put("/:id", protect, adminOnly, updateTicketStatus);
router.post("/:id/comment", protect, adminOnly, addComment);
router.post("/:id/rate", protect, submitRating); // resident rates resolved ticket

module.exports = router;
