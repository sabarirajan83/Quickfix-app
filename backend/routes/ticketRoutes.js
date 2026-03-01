const express = require("express");
const router = express.Router();
const {
  createTicket,
  getMyTickets,
  getAllTickets,
  updateTicketStatus,
} = require("../controllers/ticketController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

router.post("/", protect, createTicket); // Resident: raise ticket
router.get("/my", protect, getMyTickets); // Resident: view own tickets
router.get("/", protect, adminOnly, getAllTickets); // Admin: view all tickets
router.put("/:id", protect, adminOnly, updateTicketStatus); // Admin: update status

module.exports = router;
