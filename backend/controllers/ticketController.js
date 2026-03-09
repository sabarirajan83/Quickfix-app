const Ticket = require("../models/Ticket");

// @route POST /api/tickets — Resident creates a ticket
exports.createTicket = async (req, res) => {
  const { title, roomNumber, category, description, priority } = req.body;
  try {
    const ticket = await Ticket.create({
      title,
      roomNumber,
      category,
      description,
      priority: priority || "Medium",
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

// @route GET /api/tickets — Admin views ALL active tickets
exports.getAllTickets = async (req, res) => {
  try {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const tickets = await Ticket.find({
      $or: [
        { status: { $ne: "Resolved" } },
        { status: "Resolved", resolvedAt: { $gte: oneMonthAgo } },
      ],
    })
      .populate("resident", "name email")
      .sort({ createdAt: -1 });

    res.json(tickets);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route GET /api/tickets/history — Admin views old resolved tickets (paginated)
exports.getTicketHistory = async (req, res) => {
  try {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const { from, to } = req.query;

    // Build date filter
    let dateFilter = {};
    if (from || to) {
      if (from) dateFilter.$gte = new Date(from);
      if (to) {
        const toDate = new Date(to);
        toDate.setHours(23, 59, 59, 999); // include full end day
        dateFilter.$lte = toDate;
      }
    } else {
      dateFilter.$lt = oneMonthAgo; // default: older than 1 month
    }

    const filter = { status: "Resolved", resolvedAt: dateFilter };

    const [tickets, total] = await Promise.all([
      Ticket.find(filter)
        .populate("resident", "name email")
        .sort({ resolvedAt: -1 })
        .skip(skip)
        .limit(limit),
      Ticket.countDocuments(filter),
    ]);

    res.json({
      tickets,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      hasMore: skip + tickets.length < total,
    });
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

// @route POST /api/tickets/:id/comment — Admin adds a comment
exports.addComment = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

    ticket.comments.push({
      text: req.body.text,
      addedBy: req.user.name,
      addedAt: new Date(),
    });

    await ticket.save();
    res.status(201).json(ticket);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route GET /api/tickets/stats — Admin gets ticket counts
exports.getStats = async (req, res) => {
  try {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const [pending, inProgress, resolved] = await Promise.all([
      Ticket.countDocuments({ status: "Pending" }),
      Ticket.countDocuments({ status: "In Progress" }),
      Ticket.countDocuments({
        status: "Resolved",
        resolvedAt: { $gte: oneMonthAgo },
      }),
    ]);

    res.json({ pending, inProgress, resolved });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
