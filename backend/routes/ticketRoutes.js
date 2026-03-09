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
const { protect, adminOnly } = require("../middleware/authMiddleware");

// STEP 1 — Static named routes MUST come first before any /:id routes
router.get("/stats", protect, adminOnly, getStats);
router.get("/history", protect, adminOnly, getTicketHistory);
router.get("/my", protect, getMyTickets);

// STEP 2 — General routes
router.post("/", protect, createTicket);
router.get("/", protect, adminOnly, getAllTickets);

// STEP 3 — Dynamic /:id routes MUST come last
router.put("/:id", protect, adminOnly, updateTicketStatus);
router.post("/:id/comment", protect, adminOnly, addComment);

module.exports = router;
