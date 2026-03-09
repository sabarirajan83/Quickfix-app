import { useState, useEffect, useCallback } from "react";
import api from "../utils/api";
import TicketCard from "../components/TicketCard";

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

  // History pagination + date filter state
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  // Fetch active tickets and stats
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

  // Fetch history — reset list when filters change
  const fetchHistory = useCallback(
    async (resetPage = true) => {
      const currentPage = resetPage ? 1 : page;
      if (resetPage) {
        setPage(1);
        setHistory([]);
      }
      setLoadingHistory(resetPage);
      setLoadingMore(!resetPage);

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
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const handleCommentAdded = (updatedTicket) => {
    setTickets((prev) =>
      prev.map((t) => (t._id === updatedTicket._id ? updatedTicket : t)),
    );
    setHistory((prev) =>
      prev.map((t) => (t._id === updatedTicket._id ? updatedTicket : t)),
    );
  };

  const handleSearch = () => fetchHistory(true);

  const handleClear = () => {
    setFromDate("");
    setToDate("");
    setTimeout(() => fetchHistory(true), 0);
  };

  const handleLoadMore = () => {
    setPage((p) => {
      const nextPage = p + 1;
      // Fetch next page
      const params = { page: nextPage, limit: 10 };
      if (fromDate) params.from = fromDate;
      if (toDate) params.to = toDate;
      setLoadingMore(true);
      api
        .get("/tickets/history", { params })
        .then(({ data }) => {
          setHistory((prev) => [...prev, ...data.tickets]);
          setHasMore(data.hasMore);
          setLoadingMore(false);
        })
        .catch(() => setLoadingMore(false));
      return nextPage;
    });
  };

  const filtered =
    filter === "All" ? tickets : tickets.filter((t) => t.status === filter);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Admin Dashboard</h2>

      {/* Tab Switcher */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={() => setActiveTab("dashboard")}
          className={`px-5 py-2 rounded-lg font-semibold text-sm transition ${
            activeTab === "dashboard"
              ? "bg-blue-700 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          📋 Dashboard
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`px-5 py-2 rounded-lg font-semibold text-sm transition ${
            activeTab === "history"
              ? "bg-purple-700 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          🗂 History
        </button>
      </div>

      {/* ── DASHBOARD TAB ── */}
      {activeTab === "dashboard" && (
        <>
          {/* Stats Cards — only 3 cards, no history count */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-yellow-600">
                {stats.pending}
              </p>
              <p className="text-sm text-yellow-700 font-medium mt-1">
                🕐 Pending
              </p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-blue-600">
                {stats.inProgress}
              </p>
              <p className="text-sm text-blue-700 font-medium mt-1">
                ⚙️ In Progress
              </p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-green-600">
                {stats.resolved}
              </p>
              <p className="text-sm text-green-700 font-medium mt-1">
                ✅ Resolved
              </p>
            </div>
          </div>

          {/* Filter Buttons */}
          <div className="flex gap-2 mb-6 flex-wrap">
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
                {s} (
                {s === "All"
                  ? tickets.length
                  : tickets.filter((t) => t.status === s).length}
                )
              </button>
            ))}
          </div>

          {/* Ticket List */}
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
                  onCommentAdded={handleCommentAdded}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* ── HISTORY TAB ── */}
      {activeTab === "history" && (
        <>
          {/* Info Banner */}
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 mb-6">
            <p className="text-sm text-purple-700 font-medium mb-3">
              🗂 Tickets resolved more than 1 month ago.
              {total > 0 && (
                <span className="ml-2 text-purple-500">
                  ({total} total found)
                </span>
              )}
            </p>

            {/* Date Range Search */}
            <div className="flex gap-3 flex-wrap items-end">
              <div>
                <label className="text-xs text-gray-600 block mb-1">
                  From Date
                </label>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>
              <div>
                <label className="text-xs text-gray-600 block mb-1">
                  To Date
                </label>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>
              <button
                onClick={handleSearch}
                className="bg-purple-700 text-white px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-purple-800 transition"
              >
                🔍 Search
              </button>
              <button
                onClick={handleClear}
                className="bg-gray-200 text-gray-700 px-4 py-1.5 rounded-lg text-sm hover:bg-gray-300 transition"
              >
                ✕ Clear
              </button>
            </div>
          </div>

          {/* History List */}
          {loadingHistory ? (
            <div className="text-center py-10">
              <p className="text-gray-400 text-sm">Loading history...</p>
            </div>
          ) : history.length === 0 ? (
            <p className="text-gray-500">
              No tickets found for this date range.
            </p>
          ) : (
            <>
              <div className="space-y-4">
                {history.map((t) => (
                  <TicketCard
                    key={t._id}
                    ticket={t}
                    isAdmin={true}
                    onStatusChange={handleStatusChange}
                    onCommentAdded={handleCommentAdded}
                  />
                ))}
              </div>

              {/* Load More Button */}
              {hasMore && (
                <div className="text-center mt-6">
                  <button
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    className="bg-purple-700 text-white px-6 py-2 rounded-lg font-semibold text-sm hover:bg-purple-800 disabled:opacity-50 transition"
                  >
                    {loadingMore ? "Loading..." : "Load More"}
                  </button>
                </div>
              )}

              {/* End of results message */}
              {!hasMore && history.length > 0 && (
                <p className="text-center text-gray-400 text-xs mt-6">
                  All {total} records loaded
                </p>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
