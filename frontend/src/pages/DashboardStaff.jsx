import { useState, useEffect } from "react";
import api from "../utils/api";
import TicketCard from "../components/TicketCard";
import { useAuth } from "../context/AuthContext";
import { Wrench, CheckCircle, Clock, AlertCircle } from "lucide-react";

export default function DashboardStaff() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);

  const fetchTickets = async () => {
    try {
      const { data } = await api.get("/staff/my-tickets");
      setTickets(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.put(`/staff/tickets/${id}/status`, { status: newStatus });
      setTickets((prev) =>
        prev.map((t) => (t._id === id ? { ...t, status: newStatus } : t)),
      );
    } catch {
      alert("Failed to update status");
    }
  };

  const counts = {
    All: tickets.length,
    Pending: tickets.filter((t) => t.status === "Pending").length,
    "In Progress": tickets.filter((t) => t.status === "In Progress").length,
    Resolved: tickets.filter((t) => t.status === "Resolved").length,
  };

  const filtered =
    filter === "All" ? tickets : tickets.filter((t) => t.status === filter);

  const STATS = [
    {
      label: "Total Assigned",
      value: tickets.length,
      icon: <Wrench size={18} />,
      color: "#3b82f6",
    },
    {
      label: "Pending",
      value: counts["Pending"],
      icon: <Clock size={18} />,
      color: "#f59e0b",
    },
    {
      label: "In Progress",
      value: counts["In Progress"],
      icon: <AlertCircle size={18} />,
      color: "#8b5cf6",
    },
    {
      label: "Resolved",
      value: counts["Resolved"],
      icon: <CheckCircle size={18} />,
      color: "#10b981",
    },
  ];

  return (
    <div style={{ maxWidth: "860px", margin: "0 auto", padding: "32px 20px" }}>
      {/* Header */}
      <div style={{ marginBottom: "28px", animation: "fadeInUp 0.4s ease" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "6px",
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: "12px",
              background: "var(--accent)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 14px rgba(59,130,246,0.35)",
            }}
          >
            <Wrench size={22} color="#fff" />
          </div>
          <div>
            <h1
              style={{
                fontFamily: "Syne",
                fontWeight: 800,
                fontSize: "24px",
                color: "var(--text-primary)",
              }}
            >
              Welcome, {user?.name?.split(" ")[0]}
            </h1>
            <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>
              {user?.specialty || "Maintenance Staff"} · Assigned tickets
              dashboard
            </p>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "12px",
          marginBottom: "28px",
        }}
        className="stagger"
      >
        {STATS.map((s) => (
          <div
            key={s.label}
            className="stat-card animate-fadeInUp"
            style={{ padding: "16px" }}
          >
            <div
              style={{
                color: s.color,
                marginBottom: "8px",
                display: "flex",
                justifyContent: "center",
              }}
            >
              {s.icon}
            </div>
            <div
              style={{
                fontFamily: "Syne",
                fontWeight: 800,
                fontSize: "28px",
                color: s.color,
              }}
            >
              {s.value}
            </div>
            <div
              style={{
                fontSize: "12px",
                color: "var(--text-muted)",
                fontWeight: 600,
                marginTop: "2px",
              }}
            >
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div
        style={{
          display: "flex",
          gap: "6px",
          marginBottom: "20px",
          flexWrap: "wrap",
        }}
      >
        {Object.entries(counts).map(([s, count]) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            style={{
              padding: "8px 16px",
              borderRadius: "10px",
              border: `1px solid ${filter === s ? "var(--accent)" : "var(--border)"}`,
              background:
                filter === s ? "var(--accent)" : "var(--bg-secondary)",
              color: filter === s ? "#fff" : "var(--text-secondary)",
              fontFamily: "Syne",
              fontWeight: 700,
              fontSize: "12px",
              cursor: "pointer",
              transition: "all 0.2s ease",
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

      {/* Ticket list */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <div
            style={{
              width: 32,
              height: 32,
              border: "3px solid var(--border)",
              borderTopColor: "var(--accent)",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
              margin: "0 auto 12px",
            }}
          />
          <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>
            Loading your tickets...
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "60px 20px",
            background: "var(--bg-secondary)",
            borderRadius: "16px",
            border: "1px dashed var(--border)",
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
              ? "No tickets assigned yet"
              : "No tickets in this category"}
          </h3>
          <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>
            {tickets.length === 0
              ? "The admin will assign tickets to you shortly."
              : "Try a different filter"}
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {filtered.map((t, i) => (
            <div
              key={t._id}
              style={{ animation: `fadeInUp 0.4s ease ${i * 0.05}s both` }}
            >
              <TicketCard
                ticket={t}
                isAdmin={false}
                isStaff={true}
                onStatusChange={handleStatusChange}
              />
            </div>
          ))}
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
