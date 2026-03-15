const User = require("../models/User");
const Ticket = require("../models/Ticket");

// @route GET /api/staff — Admin gets all staff members
exports.getAllStaff = async (req, res) => {
  try {
    const staff = await User.find({ role: "staff" })
      .select("-password")
      .sort({ name: 1 });
    res.json(staff);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route POST /api/staff/create — Admin creates a staff account
exports.createStaff = async (req, res) => {
  const { name, email, password, specialty } = req.body;
  try {
    if (await User.findOne({ email }))
      return res.status(400).json({ message: "Email already registered" });

    const staff = await User.create({
      name,
      email,
      password,
      role: "staff",
      specialty: specialty || "",
    });

    res.status(201).json({
      _id: staff._id,
      name: staff.name,
      email: staff.email,
      role: staff.role,
      specialty: staff.specialty,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route PUT /api/staff/assign/:ticketId — Admin assigns ticket to staff
exports.assignTicket = async (req, res) => {
  const { staffId } = req.body;
  try {
    const ticket = await Ticket.findById(req.params.ticketId);
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

    // Allow unassigning by passing staffId as null
    ticket.assignedTo = staffId || null;

    // Auto set to In Progress when assigned
    if (staffId && ticket.status === "Pending") {
      ticket.status = "In Progress";
    }

    const updated = await ticket.save();
    await updated.populate("assignedTo", "name email specialty");
    await updated.populate("resident", "name email");
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route GET /api/staff/my-tickets — Staff gets their assigned tickets
exports.getMyAssignedTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find({ assignedTo: req.user._id })
      .populate("resident", "name email")
      .sort({ createdAt: -1 });
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route PUT /api/staff/tickets/:id/status — Staff updates their ticket status
exports.updateAssignedTicketStatus = async (req, res) => {
  try {
    const ticket = await Ticket.findOne({
      _id: req.params.id,
      assignedTo: req.user._id, // Staff can only update their own tickets
    });

    if (!ticket)
      return res
        .status(404)
        .json({ message: "Ticket not found or not assigned to you" });

    ticket.status = req.body.status || ticket.status;

    if (req.body.status === "Resolved" && !ticket.resolvedAt) {
      ticket.resolvedAt = new Date();
    }
    if (req.body.status !== "Resolved") {
      ticket.resolvedAt = null;
    }

    const updated = await ticket.save();
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
