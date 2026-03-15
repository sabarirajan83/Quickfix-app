const express = require("express");
const router = express.Router();
const {
  getActiveAnnouncements,
  getAllAnnouncements,
  createAnnouncement,
  toggleAnnouncement,
  deleteAnnouncement,
} = require("../controllers/announcementController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

router.get("/", protect, getActiveAnnouncements);
router.get("/all", protect, adminOnly, getAllAnnouncements);
router.post("/", protect, adminOnly, createAnnouncement);
router.put("/:id/toggle", protect, adminOnly, toggleAnnouncement);
router.delete("/:id", protect, adminOnly, deleteAnnouncement);

module.exports = router;
