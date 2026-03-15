import { useState, useEffect, useRef } from "react";
import { Bell, X, Check, CheckCheck } from "lucide-react";
import api from "../utils/api";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const TYPE_ICON = {
  ticket_update: "🔄",
  new_ticket: "🎫",
  assignment: "👤",
  announcement: "📢",
};

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  // Fetch unread count every 30 seconds
  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const { data } = await api.get("/notifications/unread-count");
      setUnreadCount(data.count);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/notifications");
      setNotifications(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = () => {
    setOpen(!open);
    if (!open) fetchNotifications();
  };

  const handleMarkAllRead = async () => {
    try {
      await api.put("/notifications/mark-all-read");
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkOneRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n)),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div ref={dropdownRef} style={{ position: "relative" }}>
      {/* Bell button */}
      <button
        onClick={handleOpen}
        style={{
          position: "relative",
          width: 38,
          height: 38,
          background: open ? "var(--accent-light)" : "transparent",
          border: `1px solid ${open ? "var(--accent)" : "transparent"}`,
          borderRadius: "10px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.2s ease",
        }}
        title="Notifications"
      >
        <Bell
          size={16}
          style={{
            color: open ? "var(--accent)" : "var(--text-secondary)",
            animation: unreadCount > 0 ? "bellRing 1s ease infinite" : "none",
          }}
        />
        {/* Unread badge */}
        {unreadCount > 0 && (
          <span
            style={{
              position: "absolute",
              top: 4,
              right: 4,
              width: unreadCount > 9 ? 18 : 14,
              height: 14,
              background: "#ef4444",
              borderRadius: "100px",
              fontSize: "9px",
              fontWeight: 800,
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "Syne",
              border: "2px solid var(--bg-primary)",
            }}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            right: 0,
            width: 340,
            background: "var(--bg-secondary)",
            border: "1px solid var(--border)",
            borderRadius: "16px",
            boxShadow: "var(--shadow-lg)",
            zIndex: 200,
            overflow: "hidden",
            animation: "fadeInUp 0.2s ease",
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "14px 16px",
              borderBottom: "1px solid var(--border)",
            }}
          >
            <h3
              style={{
                fontFamily: "Syne",
                fontWeight: 700,
                fontSize: "14px",
                color: "var(--text-primary)",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <Bell size={14} style={{ color: "var(--accent)" }} />
              Notifications
              {unreadCount > 0 && (
                <span
                  style={{
                    background: "#ef4444",
                    color: "#fff",
                    borderRadius: "100px",
                    padding: "1px 7px",
                    fontSize: "10px",
                    fontFamily: "Syne",
                  }}
                >
                  {unreadCount} new
                </span>
              )}
            </h3>
            <div style={{ display: "flex", gap: "4px" }}>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: "4px 8px",
                    borderRadius: "8px",
                    fontSize: "11px",
                    color: "var(--accent)",
                    fontFamily: "Syne",
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                  title="Mark all as read"
                >
                  <CheckCheck size={12} /> All read
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "4px",
                  borderRadius: "8px",
                  color: "var(--text-muted)",
                }}
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Notification list */}
          <div style={{ maxHeight: "360px", overflowY: "auto" }}>
            {loading ? (
              <div style={{ padding: "32px", textAlign: "center" }}>
                <div
                  style={{
                    width: 24,
                    height: 24,
                    border: "2px solid var(--border)",
                    borderTopColor: "var(--accent)",
                    borderRadius: "50%",
                    animation: "spin 0.8s linear infinite",
                    margin: "0 auto",
                  }}
                />
              </div>
            ) : notifications.length === 0 ? (
              <div style={{ padding: "32px", textAlign: "center" }}>
                <div style={{ fontSize: "32px", marginBottom: "8px" }}>🔔</div>
                <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>
                  No notifications yet
                </p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n._id}
                  onClick={() => !n.read && handleMarkOneRead(n._id)}
                  style={{
                    padding: "12px 16px",
                    borderBottom: "1px solid var(--border)",
                    background: n.read ? "transparent" : "var(--accent-light)",
                    cursor: n.read ? "default" : "pointer",
                    transition: "background 0.2s ease",
                    display: "flex",
                    gap: "10px",
                    alignItems: "flex-start",
                  }}
                >
                  {/* Icon */}
                  <span
                    style={{
                      fontSize: "18px",
                      flexShrink: 0,
                      marginTop: "1px",
                    }}
                  >
                    {TYPE_ICON[n.type] || "🔔"}
                  </span>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      style={{
                        fontSize: "13px",
                        color: "var(--text-primary)",
                        lineHeight: 1.4,
                        marginBottom: "3px",
                      }}
                    >
                      {n.message}
                    </p>
                    <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                      {dayjs(n.createdAt).fromNow()}
                    </p>
                  </div>

                  {/* Unread dot */}
                  {!n.read && (
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        background: "var(--accent)",
                        borderRadius: "50%",
                        flexShrink: 0,
                        marginTop: "5px",
                      }}
                    />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes bellRing {
          0%, 100% { transform: rotate(0deg); }
          20%       { transform: rotate(15deg); }
          40%       { transform: rotate(-15deg); }
          60%       { transform: rotate(8deg); }
          80%       { transform: rotate(-8deg); }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
