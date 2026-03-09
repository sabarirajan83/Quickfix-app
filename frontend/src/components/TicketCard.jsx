import { useState } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import api from "../utils/api";

dayjs.extend(relativeTime);

const priorityColor = (priority) => {
  if (priority === "Low") return "bg-gray-100 text-gray-700";
  if (priority === "Medium") return "bg-blue-100 text-blue-700";
  if (priority === "High") return "bg-orange-100 text-orange-700";
  if (priority === "Urgent") return "bg-red-100 text-red-700";
  return "bg-gray-100 text-gray-700";
};

const statusColor = (status) => {
  if (status === "Pending") return "bg-yellow-100 text-yellow-800";
  if (status === "In Progress") return "bg-blue-100 text-blue-800";
  return "bg-green-100 text-green-800";
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

  const handleAddComment = async () => {
    if (!commentText.trim()) return;
    setSubmitting(true);
    try {
      const { data } = await api.post(`/tickets/${ticket._id}/comment`, {
        text: commentText,
      });
      setCommentText("");
      if (onCommentAdded) onCommentAdded(data);
    } catch (err) {
      alert("Failed to add comment");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition">
      {/* Header */}
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-semibold text-gray-800">{ticket.title}</h3>
        <div className="flex gap-2 flex-wrap justify-end">
          <span
            className={`text-xs font-bold px-2 py-1 rounded-full ${priorityColor(ticket.priority)}`}
          >
            🔥 {ticket.priority}
          </span>
          <span
            className={`text-xs font-bold px-2 py-1 rounded-full ${statusColor(ticket.status)}`}
          >
            {ticket.status}
          </span>
        </div>
      </div>

      {/* Details */}
      <p className="text-sm text-gray-500 mb-1">
        🏠 Room: <strong>{ticket.roomNumber}</strong> &nbsp;|&nbsp; 🗂{" "}
        {ticket.category}
      </p>

      {isAdmin && ticket.resident && (
        <p className="text-sm text-gray-500 mb-1">
          👤 {ticket.resident.name} — {ticket.resident.email}
        </p>
      )}

      <p className="text-sm text-gray-600 mt-2">{ticket.description}</p>

      {/* Timestamps */}
      <div className="flex gap-4 mt-2">
        <p className="text-xs text-gray-400">
          🕐 Raised {dayjs(ticket.createdAt).fromNow()}
        </p>
        {ticket.updatedAt !== ticket.createdAt && (
          <p className="text-xs text-gray-400">
            ✏️ Updated {dayjs(ticket.updatedAt).fromNow()}
          </p>
        )}
      </div>

      {/* Admin Status Dropdown */}
      {isAdmin && (
        <div className="mt-3">
          <select
            value={ticket.status}
            onChange={(e) => onStatusChange(ticket._id, e.target.value)}
            className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option>Pending</option>
            <option>In Progress</option>
            <option>Resolved</option>
          </select>
        </div>
      )}

      {/* Comments Toggle Button */}
      <div className="mt-3">
        <button
          onClick={() => setShowComments(!showComments)}
          className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-1.5 rounded-full transition font-medium"
        >
          {showComments ? "🔼 Hide Comments" : "🔽 Show Comments"}
          {ticket.comments?.length > 0 && (
            <span className="ml-1 bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded-full">
              {ticket.comments.length}
            </span>
          )}
        </button>

        {/* Comments Section */}
        {showComments && (
          <div className="mt-3 space-y-2">
            {ticket.comments?.length === 0 && (
              <p className="text-xs text-gray-400 italic">No comments yet.</p>
            )}
            {ticket.comments?.map((c, i) => (
              <div
                key={i}
                className="bg-gray-50 border border-gray-200 rounded-lg p-3"
              >
                <p className="text-sm text-gray-700">{c.text}</p>
                <p className="text-xs text-gray-400 mt-1">
                  — {c.addedBy} · {dayjs(c.addedAt).fromNow()}
                </p>
              </div>
            ))}

            {/* Add Comment — Admin Only */}
            {isAdmin && (
              <div className="flex gap-2 mt-2">
                <input
                  type="text"
                  placeholder="Add a note for the resident..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <button
                  onClick={handleAddComment}
                  disabled={submitting}
                  className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50 transition"
                >
                  {submitting ? "..." : "Add"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
