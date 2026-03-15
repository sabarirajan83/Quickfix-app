import { useState } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import api from "../utils/api";
import {
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Send,
  Clock,
  RefreshCw,
} from "lucide-react";

dayjs.extend(relativeTime);

const PRIORITY_CONFIG = {
  Low: { color: "#6b7280", bg: "rgba(107,114,128,0.1)", dot: "#6b7280" },
  Medium: { color: "#3b82f6", bg: "rgba(59,130,246,0.1)", dot: "#3b82f6" },
  High: { color: "#f97316", bg: "rgba(249,115,22,0.1)", dot: "#f97316" },
  Urgent: { color: "#ef4444", bg: "rgba(239,68,68,0.1)", dot: "#ef4444" },
};

const STATUS_CONFIG = {
  Pending: {
    color: "#f59e0b",
    bg: "var(--pending-bg)",
    bar: "#f59e0b",
    label: "🕐 Pending",
  },
  "In Progress": {
    color: "#3b82f6",
    bg: "var(--inprogress-bg)",
    bar: "#3b82f6",
    label: "⚙️ In Progress",
  },
  Resolved: {
    color: "#10b981",
    bg: "var(--resolved-bg)",
    bar: "#10b981",
    label: "✅ Resolved",
  },
};

export default function TicketCard({
  ticket,
  isAdmin,
  onStatusChange,
  onCommentAdded,
}) {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [hovered, setHovered] = useState(false);

  const priority = PRIORITY_CONFIG[ticket.priority] || PRIORITY_CONFIG.Medium;
  const status = STATUS_CONFIG[ticket.status] || STATUS_CONFIG["Pending"];

  const handleAddComment = async () => {
    if (!commentText.trim()) return;
    setSubmitting(true);
    try {
      const { data } = await api.post(`/tickets/${ticket._id}/comment`, {
        text: commentText,
      });
      setCommentText("");
      if (onCommentAdded) onCommentAdded(data);
    } catch {
      alert("Failed to add comment");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "var(--bg-secondary)",
        border: `1px solid ${hovered ? status.color + "40" : "var(--border)"}`,
        borderRadius: "16px",
        padding: "20px 20px 20px 24px",
        position: "relative",
        overflow: "hidden",
        transition: "all 0.25s ease",
        boxShadow: hovered ? `0 8px 32px ${status.color}18` : "var(--shadow)",
        transform: hovered ? "translateY(-2px)" : "none",
        animation: "fadeInUp 0.4s ease forwards",
      }}
    >
      {/* Status bar */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: "4px",
          background: status.bar,
          borderRadius: "16px 0 0 16px",
        }}
      />

      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "10px",
        }}
      >
        <h3
          style={{
            fontFamily: "Syne",
            fontWeight: 700,
            fontSize: "15px",
            color: "var(--text-primary)",
            flex: 1,
            marginRight: "12px",
          }}
        >
          {ticket.title}
        </h3>
        <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
          {/* Priority badge */}
          <span
            style={{
              background: priority.bg,
              color: priority.color,
              padding: "3px 10px",
              borderRadius: "100px",
              fontSize: "11px",
              fontWeight: 700,
              fontFamily: "Syne",
              letterSpacing: "0.03em",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: priority.dot,
                display: "inline-block",
              }}
            />
            {ticket.priority}
          </span>
          {/* Status badge */}
          <span
            style={{
              background: status.bg,
              color: status.color,
              padding: "3px 10px",
              borderRadius: "100px",
              fontSize: "11px",
              fontWeight: 700,
              fontFamily: "Syne",
            }}
          >
            {status.label}
          </span>
        </div>
      </div>

      {/* Meta info */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "12px",
          marginBottom: "8px",
        }}
      >
        <span
          style={{
            fontSize: "13px",
            color: "var(--text-secondary)",
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          🏠 <strong>Room {ticket.roomNumber}</strong>
        </span>
        <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
          🗂 {ticket.category}
        </span>
        {isAdmin && ticket.resident && (
          <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
            👤 {ticket.resident.name}
          </span>
        )}
      </div>

      {/* Description */}
      <p
        style={{
          fontSize: "13px",
          color: "var(--text-muted)",
          lineHeight: 1.6,
          marginBottom: "12px",
        }}
      >
        {ticket.description}
      </p>

      {/* Timestamps */}
      <div
        style={{
          display: "flex",
          gap: "16px",
          marginBottom: isAdmin || ticket.comments?.length > 0 ? "14px" : "0",
        }}
      >
        <span
          style={{
            fontSize: "11px",
            color: "var(--text-muted)",
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          <Clock size={10} /> Raised {dayjs(ticket.createdAt).fromNow()}
        </span>
        {ticket.updatedAt !== ticket.createdAt && (
          <span
            style={{
              fontSize: "11px",
              color: "var(--text-muted)",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <RefreshCw size={10} /> Updated {dayjs(ticket.updatedAt).fromNow()}
          </span>
        )}
      </div>

      {/* Admin controls */}
      {isAdmin && (
        <div style={{ marginBottom: "12px" }}>
          <label className="label" style={{ marginBottom: "6px" }}>
            Update Status
          </label>
          <select
            value={ticket.status}
            onChange={(e) => onStatusChange(ticket._id, e.target.value)}
            className="input"
            style={{ maxWidth: "220px" }}
          >
            <option>Pending</option>
            <option>In Progress</option>
            <option>Resolved</option>
          </select>
        </div>
      )}

      {/* Comments toggle */}
      <button
        onClick={() => setShowComments(!showComments)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          background: showComments
            ? "var(--accent-light)"
            : "var(--bg-tertiary)",
          color: showComments ? "var(--accent)" : "var(--text-muted)",
          border: `1px solid ${showComments ? "var(--accent)" : "var(--border)"}`,
          borderRadius: "100px",
          padding: "6px 14px",
          fontSize: "12px",
          fontWeight: 600,
          fontFamily: "Syne",
          cursor: "pointer",
          transition: "all 0.2s ease",
        }}
      >
        <MessageSquare size={12} />
        {ticket.comments?.length > 0
          ? `${ticket.comments.length} Comment${ticket.comments.length > 1 ? "s" : ""}`
          : "Comments"}
        {showComments ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
      </button>

      {/* Comments section */}
      {showComments && (
        <div style={{ marginTop: "14px", animation: "fadeInUp 0.3s ease" }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              marginBottom: "12px",
            }}
          >
            {ticket.comments?.length === 0 && (
              <p
                style={{
                  fontSize: "12px",
                  color: "var(--text-muted)",
                  fontStyle: "italic",
                }}
              >
                No comments yet.
              </p>
            )}
            {ticket.comments?.map((c, i) => (
              <div
                key={i}
                style={{
                  background: "var(--bg-tertiary)",
                  border: "1px solid var(--border)",
                  borderRadius: "10px",
                  padding: "10px 14px",
                  animation: `fadeInUp 0.3s ease ${i * 0.05}s both`,
                }}
              >
                <p
                  style={{
                    fontSize: "13px",
                    color: "var(--text-primary)",
                    marginBottom: "4px",
                  }}
                >
                  {c.text}
                </p>
                <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                  — {c.addedBy} · {dayjs(c.addedAt).fromNow()}
                </p>
              </div>
            ))}
          </div>

          {isAdmin && (
            <div style={{ display: "flex", gap: "8px" }}>
              <input
                type="text"
                placeholder="Add a note for the resident..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
                className="input"
                style={{ flex: 1 }}
              />
              <button
                onClick={handleAddComment}
                disabled={submitting || !commentText.trim()}
                className="btn btn-primary"
                style={{ padding: "10px 16px", flexShrink: 0 }}
              >
                {submitting ? "..." : <Send size={14} />}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
