import { useState } from "react";
import api from "../utils/api";
import { Star } from "lucide-react";

export default function RatingPrompt({ ticket, onRated }) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Already rated — show submitted rating
  if (ticket.rating) {
    return (
      <div
        style={{
          background: "var(--resolved-bg)",
          border: "1px solid #10b981",
          borderRadius: "12px",
          padding: "12px 16px",
          marginTop: "8px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          fontSize: "13px",
          color: "#10b981",
          flexWrap: "wrap",
        }}
      >
        <span style={{ fontWeight: 600 }}>You rated this:</span>
        <span style={{ display: "flex", gap: "2px" }}>
          {[1, 2, 3, 4, 5].map((s) => (
            <Star
              key={s}
              size={14}
              fill={s <= ticket.rating ? "#f59e0b" : "none"}
              stroke={s <= ticket.rating ? "#f59e0b" : "#9aa3b0"}
            />
          ))}
        </span>
        {ticket.ratingFeedback && (
          <span style={{ color: "var(--text-muted)", fontStyle: "italic" }}>
            "{ticket.ratingFeedback}"
          </span>
        )}
      </div>
    );
  }

  // Already submitted in this session
  if (submitted) {
    return (
      <div
        style={{
          background: "var(--resolved-bg)",
          border: "1px solid #10b981",
          borderRadius: "12px",
          padding: "12px 16px",
          marginTop: "8px",
          fontSize: "13px",
          color: "#10b981",
          fontWeight: 600,
        }}
      >
        ✅ Thank you for your feedback!
      </div>
    );
  }

  const handleSubmit = async () => {
    if (!rating) return;
    setSubmitting(true);
    try {
      const { data } = await api.post(`/tickets/${ticket._id}/rate`, {
        rating,
        feedback,
      });
      setSubmitted(true);
      if (onRated) onRated(data);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to submit rating");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        background: "var(--bg-tertiary)",
        border: "1px solid var(--border)",
        borderRadius: "12px",
        padding: "16px",
        marginTop: "8px",
        animation: "fadeInUp 0.3s ease",
      }}
    >
      <p
        style={{
          fontFamily: "Syne",
          fontWeight: 700,
          fontSize: "13px",
          color: "var(--text-primary)",
          marginBottom: "12px",
        }}
      >
        ⭐ Was your issue resolved satisfactorily?
      </p>

      {/* Star selector */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          marginBottom: "12px",
        }}
      >
        {[1, 2, 3, 4, 5].map((s) => (
          <button
            key={s}
            type="button"
            onMouseEnter={() => setHovered(s)}
            onMouseLeave={() => setHovered(0)}
            onClick={() => setRating(s)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "2px",
              transform:
                hovered >= s || rating >= s ? "scale(1.2)" : "scale(1)",
              transition: "transform 0.15s ease",
            }}
          >
            <Star
              size={28}
              fill={hovered >= s || rating >= s ? "#f59e0b" : "none"}
              stroke={hovered >= s || rating >= s ? "#f59e0b" : "#9aa3b0"}
            />
          </button>
        ))}
        {rating > 0 && (
          <span
            style={{
              fontSize: "12px",
              color: "var(--text-muted)",
              marginLeft: "8px",
            }}
          >
            {["", "Poor", "Fair", "Good", "Very Good", "Excellent"][rating]}
          </span>
        )}
      </div>

      {/* Optional feedback */}
      <textarea
        placeholder="Optional: Share your feedback..."
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        className="input"
        rows={2}
        style={{ marginBottom: "10px", fontSize: "13px" }}
      />

      <button
        onClick={handleSubmit}
        disabled={!rating || submitting}
        className="btn btn-primary"
        style={{ fontSize: "13px", padding: "9px 18px" }}
      >
        {submitting ? "Submitting..." : "Submit Rating"}
      </button>
    </div>
  );
}
