import { useState, useEffect } from "react";
import api from "../utils/api";
import TicketCard from "../components/TicketCard";

export default function DashboardAdmin() {
  const [tickets, setTickets] = useState([]);
  const [filter, setFilter] = useState("All");

  const fetchTickets = async () => {
    try {
      const { data } = await api.get("/tickets");
      setTickets(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.put(`/tickets/${id}`, { status: newStatus });
      setTickets((prev) =>
        prev.map((t) => (t._id === id ? { ...t, status: newStatus } : t)),
      );
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const filtered =
    filter === "All" ? tickets : tickets.filter((t) => t.status === filter);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Admin Dashboard</h2>
      <p className="text-gray-500 mb-6 text-sm">
        Total tickets: {tickets.length}
      </p>
      <div className="flex gap-2 mb-6">
        {["All", "Pending", "In Progress", "Resolved"].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
              filter === s
                ? "bg-blue-700 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {s}
          </button>
        ))}
      </div>
      {filtered.length === 0 ? (
        <p className="text-gray-500">No tickets in this category.</p>
      ) : (
        <div className="space-y-4">
          {filtered.map((t) => (
            <TicketCard
              key={t._id}
              ticket={t}
              isAdmin={true}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}
    </div>
  );
}
