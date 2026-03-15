import { useState, useEffect } from "react";
import { X, AlertTriangle, Info, Zap } from "lucide-react";
import api from "../utils/api";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const PRIORITY_CONFIG = {
  info: {
    bg: "#eff6ff",
    border: "#bfdbfe",
    color: "#1d4ed8",
    icon: <Info size={16} />,
    darkBg: "#1e2f4d",
  },
  warning: {
    bg: "#fffbeb",
    border: "#fde68a",
    color: "#b45309",
    icon: <AlertTriangle size={16} />,
    darkBg: "#2a2010",
  },
  urgent: {
    bg: "#fef2f2",
    border: "#fecaca",
    color: "#dc2626",
    icon: <Zap size={16} />,
    darkBg: "#2a0f0f",
  },
};

function SingleBanner({ announcement, onDismiss }) {
  const config = PRIORITY_CONFIG[announcement.priority] || PRIORITY_CONFIG.info;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: "12px",
        background: config.bg,
        border: `1px solid ${config.border}`,
        borderRadius: "12px",
        padding: "14px 16px",
        animation: "fadeInUp 0.3s ease",
      }}
    >
      <span style={{ color: config.color, flexShrink: 0, marginTop: "1px" }}>
        {config.icon}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            fontFamily: "Syne",
            fontWeight: 700,
            fontSize: "13px",
            color: config.color,
            marginBottom: "2px",
          }}
        >
          {announcement.title}
        </p>
        <p
          style={{
            fontSize: "13px",
            color: config.color,
            opacity: 0.85,
            lineHeight: 1.5,
          }}
        >
          {announcement.message}
        </p>
        <p
          style={{
            fontSize: "11px",
            color: config.color,
            opacity: 0.6,
            marginTop: "4px",
          }}
        >
          Posted {dayjs(announcement.createdAt).fromNow()}
          {announcement.postedBy?.name && ` by ${announcement.postedBy.name}`}
        </p>
      </div>
      <button
        onClick={() => onDismiss(announcement._id)}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: "2px",
          color: config.color,
          opacity: 0.6,
          flexShrink: 0,
        }}
      >
        <X size={14} />
      </button>
    </div>
  );
}

export default function Banner() {
  const [announcements, setAnnouncements] = useState([]);
  const [dismissed, setDismissed] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem("qf_dismissed_announcements") || "[]",
      );
    } catch {
      return [];
    }
  });

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const { data } = await api.get("/announcements");
        setAnnouncements(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchAnnouncements();
  }, []);

  const handleDismiss = (id) => {
    const updated = [...dismissed, id];
    setDismissed(updated);
    localStorage.setItem("qf_dismissed_announcements", JSON.stringify(updated));
  };

  const visible = announcements.filter((a) => !dismissed.includes(a._id));

  if (!visible.length) return null;

  return (
    <div
      style={{
        maxWidth: "760px",
        margin: "0 auto",
        padding: "16px 20px 0",
        display: "flex",
        flexDirection: "column",
        gap: "8px",
      }}
    >
      {visible.map((a) => (
        <SingleBanner key={a._id} announcement={a} onDismiss={handleDismiss} />
      ))}
    </div>
  );
}
