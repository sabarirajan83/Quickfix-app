const express = require("express");
const router = express.Router();
const {
  getAllStaff,
  createStaff,
  assignTicket,
  getMyAssignedTickets,
  updateAssignedTicketStatus,
} = require("../controllers/staffController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

// Middleware to allow only staff role
const staffOnly = (req, res, next) => {
  if (req.user?.role === "staff") return next();
  res.status(403).json({ message: "Staff access only" });
};

// Admin routes
router.get("/", protect, adminOnly, getAllStaff);
router.post("/create", protect, adminOnly, createStaff);
router.put("/assign/:ticketId", protect, adminOnly, assignTicket);

// Staff routes
router.get("/my-tickets", protect, staffOnly, getMyAssignedTickets);
router.put(
  "/tickets/:id/status",
  protect,
  staffOnly,
  updateAssignedTicketStatus,
);

module.exports = router;
