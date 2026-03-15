import { useState, useEffect, useCallback } from "react";
import api from "../utils/api";
import TicketCard from "../components/TicketCard";
import { LayoutDashboard, History, Search, X } from "lucide-react";

export default function DashboardAdmin() {
  const [tickets, setTickets] = useState([]);
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState({
    pending: 0,
    inProgress: 0,
    resolved: 0,
  });
  const [filter, setFilter] = useState("All");
  const [activeTab, setActiveTab] = useState("dashboard");
  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchTickets = async () => {
    try {
      const [ticketRes, statsRes] = await Promise.all([
        api.get("/tickets"),
        api.get("/tickets/stats"),
      ]);
      setTickets(ticketRes.data);
      setStats(statsRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchHistory = useCallback(
    async (resetPage = true) => {
      const currentPage = resetPage ? 1 : page;
      if (resetPage) {
        setPage(1);
        setHistory([]);
      }
      resetPage ? setLoadingHistory(true) : setLoadingMore(true);
      try {
        const params = { page: currentPage, limit: 10 };
        if (fromDate) params.from = fromDate;
        if (toDate) params.to = toDate;
        const { data } = await api.get("/tickets/history", { params });
        setHistory((prev) =>
          resetPage ? data.tickets : [...prev, ...data.tickets],
        );
        setHasMore(data.hasMore);
        setTotal(data.total);
        if (!resetPage) setPage((p) => p + 1);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingHistory(false);
        setLoadingMore(false);
      }
    },
    [fromDate, toDate, page],
  );

  useEffect(() => {
    fetchTickets();
  }, []);
  useEffect(() => {
    if (activeTab === "history") fetchHistory(true);
  }, [activeTab]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.put(`/tickets/${id}`, { status: newStatus });
      fetchTickets();
    } catch {
      alert("Failed to update status");
    }
  };

  const handleCommentAdded = (updated) => {
    setTickets((p) => p.map((t) => (t._id === updated._id ? updated : t)));
    setHistory((p) => p.map((t) => (t._id === updated._id ? updated : t)));
  };

  const handleLoadMore = async () => {
    const nextPage = page + 1;
    setLoadingMore(true);
    try {
      const params = { page: nextPage, limit: 10 };
      if (fromDate) params.from = fromDate;
      if (toDate) params.to = toDate;
      const { data } = await api.get("/tickets/history", { params });
      setHistory((prev) => [...prev, ...data.tickets]);
      setHasMore(data.hasMore);
      setPage(nextPage);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMore(false);
    }
  };

  // Search filter
  const filteredTickets = tickets
    .filter((t) => filter === "All" || t.status === filter)
    .filter(
      (t) =>
        !search ||
        [t.title, t.description, t.roomNumber, t.category].some((f) =>
          f?.toLowerCase().includes(search.toLowerCase()),
        ),
    );

  const STATS = [
    {
      key: "pending",
      label: "Pending",
      value: stats.pending,
      color: "#f59e0b",
      bg: "var(--pending-bg)",
      cls: "pending",
      icon: "🕐",
    },
    {
      key: "inProgress",
      label: "In Progress",
      value: stats.inProgress,
      color: "#3b82f6",
      bg: "var(--inprogress-bg)",
      cls: "progress",
      icon: "⚙️",
    },
    {
      key: "resolved",
      label: "Resolved",
      value: stats.resolved,
      color: "#10b981",
      bg: "var(--resolved-bg)",
      cls: "resolved",
      icon: "✅",
    },
  ];

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "32px 20px" }}>
      {/* Header */}
      <div style={{ marginBottom: "28px", animation: "fadeInUp 0.4s ease" }}>
        <h1
          style={{
            fontFamily: "Syne",
            fontWeight: 800,
            fontSize: "26px",
            color: "var(--text-primary)",
            marginBottom: "4px",
          }}
        >
          Admin Dashboard
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>
          Manage and resolve all maintenance tickets
        </p>
      </div>

      {/* Tab switcher */}
      <div
        style={{
          display: "flex",
          gap: "4px",
          background: "var(--bg-secondary)",
          border: "1px solid var(--border)",
          borderRadius: "14px",
          padding: "4px",
          width: "fit-content",
          marginBottom: "28px",
          animation: "fadeInUp 0.4s ease 0.05s both",
        }}
      >
        {[
          {
            id: "dashboard",
            icon: <LayoutDashboard size={14} />,
            label: "Dashboard",
          },
          { id: "history", icon: <History size={14} />, label: "History" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "9px 18px",
              borderRadius: "10px",
              border: "none",
              cursor: "pointer",
              fontFamily: "Syne",
              fontWeight: 700,
              fontSize: "13px",
              background:
                activeTab === tab.id ? "var(--accent)" : "transparent",
              color: activeTab === tab.id ? "#fff" : "var(--text-muted)",
              boxShadow:
                activeTab === tab.id
                  ? "0 4px 12px rgba(59,130,246,0.3)"
                  : "none",
              transition: "all 0.2s ease",
            }}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* DASHBOARD TAB */}
      {activeTab === "dashboard" && (
        <>
          {/* Stats */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "16px",
              marginBottom: "28px",
            }}
            className="stagger"
          >
            {STATS.map((s) => (
              <div
                key={s.key}
                className={`stat-card ${s.cls} animate-fadeInUp`}
              >
                <div
                  style={{
                    fontSize: "32px",
                    fontFamily: "Syne",
                    fontWeight: 800,
                    color: s.color,
                    marginBottom: "4px",
                  }}
                >
                  {s.value}
                </div>
                <div
                  style={{
                    fontSize: "13px",
                    color: "var(--text-secondary)",
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "4px",
                  }}
                >
                  {s.icon} {s.label}
                </div>
              </div>
            ))}
          </div>

          {/* Search + Filter */}
          <div
            style={{
              display: "flex",
              gap: "10px",
              marginBottom: "20px",
              flexWrap: "wrap",
              animation: "fadeInUp 0.4s ease 0.15s both",
            }}
          >
            {/* Search bar */}
            <div style={{ position: "relative", flex: 1, minWidth: "200px" }}>
              <Search
                size={14}
                style={{
                  position: "absolute",
                  left: 14,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--text-muted)",
                }}
              />
              <input
                type="text"
                placeholder="Search tickets..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input"
                style={{ paddingLeft: "40px" }}
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  style={{
                    position: "absolute",
                    right: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--text-muted)",
                  }}
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Filter pills */}
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
              {["All", "Pending", "In Progress", "Resolved"].map((s) => (
                <button
                  key={s}
                  onClick={() => setFilter(s)}
                  style={{
                    padding: "10px 16px",
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
                    boxShadow:
                      filter === s
                        ? "0 4px 12px rgba(59,130,246,0.25)"
                        : "none",
                  }}
                >
                  {s} (
                  {s === "All"
                    ? tickets.length
                    : tickets.filter((t) => t.status === s).length}
                  )
                </button>
              ))}
            </div>
          </div>

          {/* Ticket list */}
          {filteredTickets.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "60px 20px",
                background: "var(--bg-secondary)",
                borderRadius: "16px",
                border: "1px dashed var(--border)",
              }}
            >
              <div style={{ fontSize: "48px", marginBottom: "12px" }}>🔍</div>
              <h3
                style={{
                  fontFamily: "Syne",
                  fontWeight: 700,
                  color: "var(--text-primary)",
                  marginBottom: "8px",
                }}
              >
                No tickets found
              </h3>
              <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>
                {search
                  ? `No results for "${search}"`
                  : "No tickets in this category"}
              </p>
            </div>
          ) : (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
              {filteredTickets.map((t, i) => (
                <div
                  key={t._id}
                  style={{ animation: `fadeInUp 0.4s ease ${i * 0.04}s both` }}
                >
                  <TicketCard
                    ticket={t}
                    isAdmin={true}
                    onStatusChange={handleStatusChange}
                    onCommentAdded={handleCommentAdded}
                  />
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* HISTORY TAB */}
      {activeTab === "history" && (
        <>
          {/* Date filter */}
          <div
            className="card"
            style={{
              padding: "20px",
              marginBottom: "24px",
              animation: "fadeInUp 0.4s ease",
            }}
          >
            <h3
              style={{
                fontFamily: "Syne",
                fontWeight: 700,
                fontSize: "14px",
                color: "var(--text-primary)",
                marginBottom: "14px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <Search size={14} style={{ color: "var(--accent)" }} />
              Search History by Date Range
              {total > 0 && (
                <span
                  style={{
                    marginLeft: "auto",
                    fontSize: "12px",
                    color: "var(--text-muted)",
                    fontFamily: "DM Sans",
                  }}
                >
                  {total} records found
                </span>
              )}
            </h3>
            <div
              style={{
                display: "flex",
                gap: "10px",
                flexWrap: "wrap",
                alignItems: "flex-end",
              }}
            >
              <div>
                <label className="label">From Date</label>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="input"
                  style={{ width: "auto" }}
                />
              </div>
              <div>
                <label className="label">To Date</label>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="input"
                  style={{ width: "auto" }}
                />
              </div>
              <button
                onClick={() => fetchHistory(true)}
                className="btn btn-primary"
              >
                <Search size={13} /> Search
              </button>
              <button
                onClick={() => {
                  setFromDate("");
                  setToDate("");
                  setTimeout(() => fetchHistory(true), 0);
                }}
                className="btn btn-secondary"
              >
                <X size={13} /> Clear
              </button>
            </div>
          </div>

          {/* History list */}
          {loadingHistory ? (
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
                Loading history...
              </p>
            </div>
          ) : history.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "60px 20px",
                background: "var(--bg-secondary)",
                borderRadius: "16px",
                border: "1px dashed var(--border)",
              }}
            >
              <div style={{ fontSize: "48px", marginBottom: "12px" }}>🗂</div>
              <h3
                style={{
                  fontFamily: "Syne",
                  fontWeight: 700,
                  color: "var(--text-primary)",
                  marginBottom: "8px",
                }}
              >
                No history found
              </h3>
              <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>
                No resolved tickets older than 1 month for this date range.
              </p>
            </div>
          ) : (
            <>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                {history.map((t, i) => (
                  <div
                    key={t._id}
                    style={{
                      animation: `fadeInUp 0.4s ease ${i * 0.04}s both`,
                    }}
                  >
                    <TicketCard
                      ticket={t}
                      isAdmin={true}
                      onStatusChange={handleStatusChange}
                      onCommentAdded={handleCommentAdded}
                    />
                  </div>
                ))}
              </div>

              {hasMore && (
                <div style={{ textAlign: "center", marginTop: "24px" }}>
                  <button
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    className="btn btn-secondary"
                    style={{ minWidth: "140px" }}
                  >
                    {loadingMore ? (
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <div
                          style={{
                            width: 14,
                            height: 14,
                            border: "2px solid var(--border)",
                            borderTopColor: "var(--accent)",
                            borderRadius: "50%",
                            animation: "spin 0.8s linear infinite",
                          }}
                        />
                        Loading...
                      </span>
                    ) : (
                      `Load More (${total - history.length} remaining)`
                    )}
                  </button>
                </div>
              )}

              {!hasMore && history.length > 0 && (
                <p
                  style={{
                    textAlign: "center",
                    color: "var(--text-muted)",
                    fontSize: "12px",
                    marginTop: "24px",
                  }}
                >
                  ✓ All {total} records loaded
                </p>
              )}
            </>
          )}
        </>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
