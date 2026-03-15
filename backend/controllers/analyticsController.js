const Ticket = require("../models/Ticket");

// Helper to get month name
const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

// @route GET /api/analytics/overview — All analytics data in one call
exports.getAnalytics = async (req, res) => {
  try {
    const allTickets = await Ticket.find({}).populate("resident", "name");

    // ── 1. Tickets per month ──
    const monthMap = {};
    allTickets.forEach((t) => {
      const d = new Date(t.createdAt);
      const key = `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
      monthMap[key] = (monthMap[key] || 0) + 1;
    });
    const ticketsPerMonth = Object.entries(monthMap).map(([month, count]) => ({
      month,
      count,
    }));

    // ── 2. Breakdown by category ──
    const categoryMap = {};
    allTickets.forEach((t) => {
      categoryMap[t.category] = (categoryMap[t.category] || 0) + 1;
    });
    const categoryBreakdown = Object.entries(categoryMap).map(
      ([name, value]) => ({ name, value }),
    );

    // ── 3. Average resolution time per category (in hours) ──
    const resolutionMap = {};
    allTickets.forEach((t) => {
      if (t.status === "Resolved" && t.resolvedAt) {
        const hours =
          (new Date(t.resolvedAt) - new Date(t.createdAt)) / (1000 * 60 * 60);
        if (!resolutionMap[t.category])
          resolutionMap[t.category] = { total: 0, count: 0 };
        resolutionMap[t.category].total += hours;
        resolutionMap[t.category].count += 1;
      }
    });
    const resolutionTime = Object.entries(resolutionMap).map(
      ([category, data]) => ({
        category,
        avgHours: Math.round(data.total / data.count),
      }),
    );

    // ── 4. Most complained room numbers (top 10) ──
    const roomMap = {};
    allTickets.forEach((t) => {
      roomMap[t.roomNumber] = (roomMap[t.roomNumber] || 0) + 1;
    });
    const topRooms = Object.entries(roomMap)
      .map(([room, count]) => ({ room, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // ── 5. Peak complaint days of the week ──
    const dayMap = {
      Sunday: 0,
      Monday: 0,
      Tuesday: 0,
      Wednesday: 0,
      Thursday: 0,
      Friday: 0,
      Saturday: 0,
    };
    allTickets.forEach((t) => {
      const day = DAYS[new Date(t.createdAt).getDay()];
      dayMap[day] += 1;
    });
    const peakDays = Object.entries(dayMap).map(([day, count]) => ({
      day,
      count,
    }));

    // ── 6. Average satisfaction score per category ──
    const satisfactionCategoryMap = {};
    allTickets.forEach((t) => {
      if (t.rating) {
        if (!satisfactionCategoryMap[t.category])
          satisfactionCategoryMap[t.category] = { total: 0, count: 0 };
        satisfactionCategoryMap[t.category].total += t.rating;
        satisfactionCategoryMap[t.category].count += 1;
      }
    });
    const satisfactionByCategory = Object.entries(satisfactionCategoryMap).map(
      ([category, data]) => ({
        category,
        avgRating: parseFloat((data.total / data.count).toFixed(1)),
        count: data.count,
      }),
    );

    // ── 7. Average satisfaction score per month ──
    const satisfactionMonthMap = {};
    allTickets.forEach((t) => {
      if (t.rating && t.ratedAt) {
        const d = new Date(t.ratedAt);
        const key = `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
        if (!satisfactionMonthMap[key])
          satisfactionMonthMap[key] = { total: 0, count: 0 };
        satisfactionMonthMap[key].total += t.rating;
        satisfactionMonthMap[key].count += 1;
      }
    });
    const satisfactionByMonth = Object.entries(satisfactionMonthMap).map(
      ([month, data]) => ({
        month,
        avgRating: parseFloat((data.total / data.count).toFixed(1)),
      }),
    );

    // ── 8. Summary totals ──
    const summary = {
      total: allTickets.length,
      pending: allTickets.filter((t) => t.status === "Pending").length,
      inProgress: allTickets.filter((t) => t.status === "In Progress").length,
      resolved: allTickets.filter((t) => t.status === "Resolved").length,
      rated: allTickets.filter((t) => t.rating).length,
      avgRating: (() => {
        const rated = allTickets.filter((t) => t.rating);
        if (!rated.length) return 0;
        return parseFloat(
          (rated.reduce((s, t) => s + t.rating, 0) / rated.length).toFixed(1),
        );
      })(),
    };

    res.json({
      ticketsPerMonth,
      categoryBreakdown,
      resolutionTime,
      topRooms,
      peakDays,
      satisfactionByCategory,
      satisfactionByMonth,
      summary,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
