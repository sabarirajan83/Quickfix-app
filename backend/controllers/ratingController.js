const Ticket = require("../models/Ticket");

// @route POST /api/tickets/:id/rate — Resident submits satisfaction rating
exports.submitRating = async (req, res) => {
  const { rating, feedback } = req.body;

  if (!rating || rating < 1 || rating > 5)
    return res.status(400).json({ message: "Rating must be between 1 and 5" });

  try {
    const ticket = await Ticket.findOne({
      _id: req.params.id,
      resident: req.user._id, // Only the resident who raised it can rate
    });

    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

    if (ticket.status !== "Resolved")
      return res
        .status(400)
        .json({ message: "Can only rate resolved tickets" });

    if (ticket.rating)
      return res
        .status(400)
        .json({ message: "You have already rated this ticket" });

    ticket.rating = rating;
    ticket.ratingFeedback = feedback || "";
    ticket.ratedAt = new Date();

    const updated = await ticket.save();
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
