const Ticket = require("../models/Ticket");

// @route POST /api/tickets — Resident creates a ticket
exports.createTicket = async (req, res) => {
  const { title, roomNumber, category, description } = req.body;
  try {
    const ticket = await Ticket.create({
      title,
      roomNumber,
      category,
      description,
      resident: req.user._id,
    });
    res.status(201).json(ticket);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route GET /api/tickets/my — Resident views their own tickets
exports.getMyTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find({ resident: req.user._id }).sort({
      createdAt: -1,
    });
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route GET /api/tickets — Admin views ALL tickets
exports.getAllTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find()
      .populate("resident", "name email") // attach resident name+email
      .sort({ createdAt: -1 });
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route PUT /api/tickets/:id — Admin updates ticket status
exports.updateTicketStatus = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

    ticket.status = req.body.status || ticket.status;
    const updated = await ticket.save();
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
