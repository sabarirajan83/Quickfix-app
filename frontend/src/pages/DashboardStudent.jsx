import { useState, useEffect } from "react";
import api from "../utils/api";
import TicketCard from "../components/TicketCard";
import RatingPrompt from "../components/RatingPrompt";
import { Plus, X, Ticket } from "lucide-react";

const CATEGORIES = [
  "Plumbing",
  "Electrical",
  "Carpentry",
  "Cleaning",
  "Internet",
  "Other",
];
const PRIORITIES = ["Low", "Medium", "High", "Urgent"];
const PRIORITY_COLORS = {
  Low: "#6b7280",
  Medium: "#3b82f6",
  High: "#f97316",
  Urgent: "#ef4444",
};

export default function DashboardStudent() {
  const [tickets, setTickets] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: "",
    roomNumber: "",
    category: "Plumbing",
    priority: "Medium",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [filter, setFilter] = useState("All");

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
      setMessage("success");
      setForm({
        title: "",
        roomNumber: "",
        category: "Plumbing",
        priority: "Medium",
        description: "",
      });
      setShowForm(false);
      fetchTickets();
      setTimeout(() => setMessage(""), 4000);
    } catch {
      setMessage("error");
    } finally {
      setLoading(false);
    }
  };

  const handleRated = (updatedTicket) => {
    setTickets((prev) =>
      prev.map((t) => (t._id === updatedTicket._id ? updatedTicket : t)),
    );
  };

  const filtered =
    filter === "All" ? tickets : tickets.filter((t) => t.status === filter);

  const counts = {
    All: tickets.length,
    Pending: tickets.filter((t) => t.status === "Pending").length,
    "In Progress": tickets.filter((t) => t.status === "In Progress").length,
    Resolved: tickets.filter((t) => t.status === "Resolved").length,
  };

  return (
    <div style={{ maxWidth: "760px", margin: "0 auto", padding: "32px 20px" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "28px",
          animation: "fadeInUp 0.4s ease",
        }}
      >
        <div>
          <h1
            style={{
              fontFamily: "Syne",
              fontWeight: 800,
              fontSize: "26px",
              color: "var(--text-primary)",
              marginBottom: "4px",
            }}
          >
            My Tickets
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>
            {tickets.length} complaint{tickets.length !== 1 ? "s" : ""}{" "}
            submitted
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn btn-primary"
        >
          {showForm ? <X size={15} /> : <Plus size={15} />}
          {showForm ? "Cancel" : "New Ticket"}
        </button>
      </div>

      {/* Toast messages */}
      {message === "success" && (
        <div
          style={{
            background: "var(--resolved-bg)",
            border: "1px solid #10b981",
            borderRadius: "12px",
            padding: "12px 16px",
            marginBottom: "20px",
            color: "#10b981",
            fontSize: "14px",
            fontWeight: 600,
            animation: "fadeInUp 0.3s ease",
          }}
        >
          ✅ Ticket raised successfully!
        </div>
      )}
      {message === "error" && (
        <div
          style={{
            background: "#fef2f2",
            border: "1px solid #fecaca",
            borderRadius: "12px",
            padding: "12px 16px",
            marginBottom: "20px",
            color: "#dc2626",
            fontSize: "14px",
            animation: "fadeInUp 0.3s ease",
          }}
        >
          ❌ Failed to submit ticket. Please try again.
        </div>
      )}

      {/* New ticket form */}
      {showForm && (
        <div
          className="card"
          style={{
            padding: "24px",
            marginBottom: "24px",
            animation: "fadeInUp 0.35s ease",
            borderColor: "var(--accent)",
          }}
        >
          <h2
            style={{
              fontFamily: "Syne",
              fontWeight: 700,
              fontSize: "17px",
              color: "var(--text-primary)",
              marginBottom: "20px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <Ticket size={18} style={{ color: "var(--accent)" }} />
            Raise a Maintenance Ticket
          </h2>
          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}
          >
            <div>
              <label className="label">Issue Title</label>
              <input
                type="text"
                placeholder="e.g. Tap is leaking"
                required
                className="input"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "12px",
              }}
            >
              <div>
                <label className="label">Room Number</label>
                <input
                  type="text"
                  placeholder="e.g. B-204"
                  required
                  className="input"
                  value={form.roomNumber}
                  onChange={(e) =>
                    setForm({ ...form, roomNumber: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="label">Category</label>
                <select
                  value={form.category}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value })
                  }
                  className="input"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Priority picker */}
            <div>
              <label className="label">Priority Level</label>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  gap: "8px",
                }}
              >
                {PRIORITIES.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setForm({ ...form, priority: p })}
                    style={{
                      padding: "10px 8px",
                      borderRadius: "10px",
                      border: `2px solid ${form.priority === p ? PRIORITY_COLORS[p] : "var(--border)"}`,
                      background:
                        form.priority === p
                          ? `${PRIORITY_COLORS[p]}15`
                          : "var(--bg-tertiary)",
                      color:
                        form.priority === p
                          ? PRIORITY_COLORS[p]
                          : "var(--text-muted)",
                      fontFamily: "Syne",
                      fontWeight: 700,
                      fontSize: "12px",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="label">Description</label>
              <textarea
                placeholder="Describe the issue in detail..."
                required
                className="input"
                rows={3}
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </div>
            <div
              style={{
                display: "flex",
                gap: "10px",
                justifyContent: "flex-end",
              }}
            >
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
              >
                {loading ? "Submitting..." : "🚀 Submit Ticket"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter tabs */}
      {tickets.length > 0 && (
        <div
          style={{
            display: "flex",
            gap: "6px",
            marginBottom: "20px",
            flexWrap: "wrap",
            animation: "fadeInUp 0.4s ease 0.1s both",
          }}
        >
          {Object.entries(counts).map(([s, count]) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className="tab"
              style={{
                background:
                  filter === s ? "var(--accent)" : "var(--bg-secondary)",
                color: filter === s ? "#fff" : "var(--text-secondary)",
                border: `1px solid ${filter === s ? "var(--accent)" : "var(--border)"}`,
                boxShadow:
                  filter === s ? "0 4px 12px rgba(59,130,246,0.25)" : "none",
              }}
            >
              {s}{" "}
              <span
                style={{
                  background:
                    filter === s
                      ? "rgba(255,255,255,0.25)"
                      : "var(--bg-tertiary)",
                  borderRadius: "100px",
                  padding: "1px 7px",
                  fontSize: "11px",
                  marginLeft: "2px",
                }}
              >
                {count}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Ticket list */}
      {filtered.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "60px 20px",
            background: "var(--bg-secondary)",
            borderRadius: "16px",
            border: "1px dashed var(--border)",
            animation: "fadeIn 0.4s ease",
          }}
        >
          <div style={{ fontSize: "48px", marginBottom: "12px" }}>🔧</div>
          <h3
            style={{
              fontFamily: "Syne",
              fontWeight: 700,
              color: "var(--text-primary)",
              marginBottom: "8px",
            }}
          >
            {tickets.length === 0
              ? "No tickets yet"
              : "No tickets in this category"}
          </h3>
          <p
            style={{
              color: "var(--text-muted)",
              fontSize: "14px",
              marginBottom: "20px",
            }}
          >
            {tickets.length === 0
              ? "Raise your first maintenance ticket above!"
              : "Try a different filter"}
          </p>
          {tickets.length === 0 && (
            <button
              onClick={() => setShowForm(true)}
              className="btn btn-primary"
            >
              <Plus size={14} /> Raise First Ticket
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {filtered.map((t, i) => (
            <div
              key={t._id}
              style={{ animation: `fadeInUp 0.4s ease ${i * 0.05}s both` }}
            >
              <TicketCard ticket={t} isAdmin={false} />
              {/* Show rating prompt only for resolved unrated tickets */}
              {t.status === "Resolved" && (
                <RatingPrompt ticket={t} onRated={handleRated} />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
