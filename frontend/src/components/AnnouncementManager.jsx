import { useState, useEffect } from "react";
import api from "../utils/api";
import { Plus, X, Eye, EyeOff, Trash2, Megaphone } from "lucide-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const PRIORITY_STYLES = {
  info: { color: "#1d4ed8", bg: "#eff6ff", label: "Info" },
  warning: { color: "#b45309", bg: "#fffbeb", label: "Warning" },
  urgent: { color: "#dc2626", bg: "#fef2f2", label: "Urgent" },
};

export default function AnnouncementManager() {
  const [announcements, setAnnouncements] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: "",
    message: "",
    priority: "info",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const fetchAnnouncements = async () => {
    try {
      const { data } = await api.get("/announcements/all");
      setAnnouncements(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/announcements", form);
      setMessage("success");
      setForm({ title: "", message: "", priority: "info" });
      setShowForm(false);
      fetchAnnouncements();
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage("error");
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (id) => {
    try {
      const { data } = await api.put(`/announcements/${id}/toggle`);
      setAnnouncements((prev) => prev.map((a) => (a._id === id ? data : a)));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this announcement?")) return;
    try {
      await api.delete(`/announcements/${id}`);
      setAnnouncements((prev) => prev.filter((a) => a._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <h3
          style={{
            fontFamily: "Syne",
            fontWeight: 700,
            fontSize: "16px",
            color: "var(--text-primary)",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <Megaphone size={16} style={{ color: "var(--accent)" }} />
          Announcements ({announcements.filter((a) => a.active).length} active)
        </h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn btn-primary"
          style={{ padding: "8px 14px", fontSize: "12px" }}
        >
          {showForm ? <X size={13} /> : <Plus size={13} />}
          {showForm ? "Cancel" : "New Announcement"}
        </button>
      </div>

      {/* Messages */}
      {message === "success" && (
        <div
          style={{
            background: "var(--resolved-bg)",
            border: "1px solid #10b981",
            borderRadius: "10px",
            padding: "10px 14px",
            marginBottom: "16px",
            color: "#10b981",
            fontSize: "13px",
          }}
        >
          ✅ Announcement posted successfully!
        </div>
      )}
      {message === "error" && (
        <div
          style={{
            background: "#fef2f2",
            border: "1px solid #fecaca",
            borderRadius: "10px",
            padding: "10px 14px",
            marginBottom: "16px",
            color: "#dc2626",
            fontSize: "13px",
          }}
        >
          ❌ Failed to post announcement.
        </div>
      )}

      {/* Create form */}
      {showForm && (
        <div
          className="card"
          style={{
            padding: "20px",
            marginBottom: "20px",
            borderColor: "var(--accent)",
            animation: "fadeInUp 0.3s ease",
          }}
        >
          <h4
            style={{
              fontFamily: "Syne",
              fontWeight: 700,
              fontSize: "14px",
              color: "var(--text-primary)",
              marginBottom: "16px",
            }}
          >
            Create Announcement
          </h4>
          <form
            onSubmit={handleCreate}
            style={{ display: "flex", flexDirection: "column", gap: "12px" }}
          >
            <div>
              <label className="label">Title</label>
              <input
                type="text"
                placeholder="e.g. Water supply interrupted Sunday"
                required
                className="input"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Message</label>
              <textarea
                placeholder="Full announcement details..."
                required
                className="input"
                rows={3}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Priority</label>
              <div style={{ display: "flex", gap: "8px" }}>
                {["info", "warning", "urgent"].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setForm({ ...form, priority: p })}
                    style={{
                      padding: "8px 16px",
                      borderRadius: "10px",
                      border: `2px solid ${form.priority === p ? PRIORITY_STYLES[p].color : "var(--border)"}`,
                      background:
                        form.priority === p
                          ? PRIORITY_STYLES[p].bg
                          : "var(--bg-tertiary)",
                      color:
                        form.priority === p
                          ? PRIORITY_STYLES[p].color
                          : "var(--text-muted)",
                      fontFamily: "Syne",
                      fontWeight: 700,
                      fontSize: "12px",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      textTransform: "capitalize",
                    }}
                  >
                    {PRIORITY_STYLES[p].label}
                  </button>
                ))}
              </div>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "10px",
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
                {loading ? "Posting..." : "📢 Post Announcement"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Announcements list */}
      {announcements.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "40px",
            background: "var(--bg-tertiary)",
            borderRadius: "12px",
          }}
        >
          <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>
            No announcements yet.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {announcements.map((a) => {
            const style = PRIORITY_STYLES[a.priority] || PRIORITY_STYLES.info;
            return (
              <div
                key={a._id}
                className="card"
                style={{
                  padding: "16px",
                  opacity: a.active ? 1 : 0.5,
                  transition: "opacity 0.2s",
                  display: "flex",
                  gap: "14px",
                  alignItems: "flex-start",
                }}
              >
                {/* Priority dot */}
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: style.color,
                    marginTop: "5px",
                    flexShrink: 0,
                  }}
                />

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      marginBottom: "4px",
                      flexWrap: "wrap",
                    }}
                  >
                    <p
                      style={{
                        fontFamily: "Syne",
                        fontWeight: 700,
                        fontSize: "14px",
                        color: "var(--text-primary)",
                      }}
                    >
                      {a.title}
                    </p>
                    <span
                      style={{
                        fontSize: "10px",
                        fontWeight: 700,
                        background: style.bg,
                        color: style.color,
                        padding: "2px 8px",
                        borderRadius: "100px",
                        fontFamily: "Syne",
                        textTransform: "uppercase",
                      }}
                    >
                      {style.label}
                    </span>
                    {!a.active && (
                      <span
                        style={{
                          fontSize: "10px",
                          color: "var(--text-muted)",
                          fontFamily: "Syne",
                        }}
                      >
                        (Hidden)
                      </span>
                    )}
                  </div>
                  <p
                    style={{
                      fontSize: "13px",
                      color: "var(--text-secondary)",
                      lineHeight: 1.5,
                    }}
                  >
                    {a.message}
                  </p>
                  <p
                    style={{
                      fontSize: "11px",
                      color: "var(--text-muted)",
                      marginTop: "6px",
                    }}
                  >
                    Posted {dayjs(a.createdAt).fromNow()}
                    {a.postedBy?.name && ` by ${a.postedBy.name}`}
                  </p>
                </div>

                {/* Actions */}
                <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
                  <button
                    onClick={() => handleToggle(a._id)}
                    title={a.active ? "Hide" : "Show"}
                    style={{
                      background: "var(--bg-tertiary)",
                      border: "1px solid var(--border)",
                      borderRadius: "8px",
                      padding: "6px",
                      cursor: "pointer",
                      color: "var(--text-muted)",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    {a.active ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                  <button
                    onClick={() => handleDelete(a._id)}
                    title="Delete"
                    style={{
                      background: "#fef2f2",
                      border: "1px solid #fecaca",
                      borderRadius: "8px",
                      padding: "6px",
                      cursor: "pointer",
                      color: "#dc2626",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
