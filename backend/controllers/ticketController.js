const Ticket = require("../models/Ticket");
const User = require("../models/User");
const { createNotification } = require("./notificationController");

// @route POST /api/tickets
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

    // Notify all admins
    const admins = await User.find({ role: "admin" });
    for (const admin of admins) {
      await createNotification({
        userId: admin._id,
        message: `New ticket: "${title}" from Room ${roomNumber}`,
        type: "new_ticket",
        ticketId: ticket._id,
      });
    }

    res.status(201).json(ticket);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route GET /api/tickets/my
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

// @route GET /api/tickets
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
      .populate("assignedTo", "name email specialty")
      .sort({ createdAt: -1 });

    res.json(tickets);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route GET /api/tickets/history
exports.getTicketHistory = async (req, res) => {
  try {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const { from, to } = req.query;

    let dateFilter = {};
    if (from || to) {
      if (from) dateFilter.$gte = new Date(from);
      if (to) {
        const toDate = new Date(to);
        toDate.setHours(23, 59, 59, 999);
        dateFilter.$lte = toDate;
      }
    } else {
      dateFilter.$lt = oneMonthAgo;
    }

    const filter = { status: "Resolved", resolvedAt: dateFilter };

    const [tickets, total] = await Promise.all([
      Ticket.find(filter)
        .populate("resident", "name email")
        .populate("assignedTo", "name email specialty")
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

// @route PUT /api/tickets/:id
exports.updateTicketStatus = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

    const oldStatus = ticket.status;
    ticket.status = req.body.status || ticket.status;

    if (req.body.status === "Resolved" && !ticket.resolvedAt) {
      ticket.resolvedAt = new Date();
    }
    if (req.body.status !== "Resolved") {
      ticket.resolvedAt = null;
    }

    const updated = await ticket.save();

    // Notify resident on status change
    if (req.body.status && req.body.status !== oldStatus) {
      await createNotification({
        userId: ticket.resident,
        message: `Your ticket "${ticket.title}" is now ${req.body.status}`,
        type: "ticket_update",
        ticketId: ticket._id,
      });
    }

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route POST /api/tickets/:id/comment
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

    // Notify resident about new comment
    await createNotification({
      userId: ticket.resident,
      message: `Admin added a note on your ticket "${ticket.title}"`,
      type: "ticket_update",
      ticketId: ticket._id,
    });

    res.status(201).json(ticket);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route GET /api/tickets/stats
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
