const Announcement = require("../models/Announcement");

// @route GET /api/announcements — Get all active announcements (residents see this)
exports.getActiveAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find({ active: true })
      .populate("postedBy", "name")
      .sort({ createdAt: -1 });
    res.json(announcements);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route GET /api/announcements/all — Admin gets all including inactive
exports.getAllAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find()
      .populate("postedBy", "name")
      .sort({ createdAt: -1 });
    res.json(announcements);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route POST /api/announcements — Admin creates announcement
exports.createAnnouncement = async (req, res) => {
  const { title, message, priority } = req.body;
  try {
    const announcement = await Announcement.create({
      title,
      message,
      priority: priority || "info",
      postedBy: req.user._id,
    });
    res.status(201).json(announcement);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route PUT /api/announcements/:id/toggle — Admin toggles active status
exports.toggleAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement)
      return res.status(404).json({ message: "Announcement not found" });
    announcement.active = !announcement.active;
    await announcement.save();
    res.json(announcement);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route DELETE /api/announcements/:id — Admin deletes announcement
exports.deleteAnnouncement = async (req, res) => {
  try {
    await Announcement.findByIdAndDelete(req.params.id);
    res.json({ message: "Announcement deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
