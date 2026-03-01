import { useState, useEffect } from "react";
import api from "../utils/api";
import TicketCard from "../components/TicketCard";

const CATEGORIES = [
  "Plumbing",
  "Electrical",
  "Carpentry",
  "Cleaning",
  "Internet",
  "Other",
];

export default function DashboardStudent() {
  const [tickets, setTickets] = useState([]);
  const [form, setForm] = useState({
    title: "",
    roomNumber: "",
    category: "Plumbing",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const fetchTickets = async () => {
    try {
      const { data } = await api.get("/tickets/my");
      setTickets(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      await api.post("/tickets", form);
      setMessage("✅ Ticket raised successfully!");
      setForm({
        title: "",
        roomNumber: "",
        category: "Plumbing",
        description: "",
      });
      fetchTickets();
    } catch (err) {
      setMessage("❌ Failed to submit ticket.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Raise a Maintenance Ticket
      </h2>
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow p-6 mb-8 space-y-4"
      >
        <input
          type="text"
          placeholder="Issue Title"
          required
          className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
        <input
          type="text"
          placeholder="Room Number"
          required
          className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={form.roomNumber}
          onChange={(e) => setForm({ ...form, roomNumber: e.target.value })}
        />
        <select
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
          className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          {CATEGORIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <textarea
          placeholder="Describe the issue..."
          required
          rows={3}
          className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-800 transition disabled:opacity-50"
        >
          {loading ? "Submitting..." : "Submit Ticket"}
        </button>
        {message && <p className="text-sm mt-1">{message}</p>}
      </form>
      <h2 className="text-xl font-bold text-gray-800 mb-4">
        My Tickets ({tickets.length})
      </h2>
      {tickets.length === 0 ? (
        <p className="text-gray-500">No tickets yet. Raise one above!</p>
      ) : (
        <div className="space-y-4">
          {tickets.map((t) => (
            <TicketCard key={t._id} ticket={t} />
          ))}
        </div>
      )}
    </div>
  );
}
