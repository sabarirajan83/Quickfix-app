import { useState, useEffect } from "react";
import api from "../utils/api";
import TicketsPerMonthChart from "../components/charts/TicketsPerMonthChart";
import CategoryPieChart from "../components/charts/CategoryPieChart";
import ResolutionTimeChart from "../components/charts/ResolutionTimeChart";
import TopRoomsChart from "../components/charts/TopRoomsChart";
import PeakDaysChart from "../components/charts/PeakDaysChart";
import SatisfactionChart from "../components/charts/SatisfactionChart";
import { RefreshCw, Calendar } from "lucide-react";

function generateMonthOptions(totalMonths = 24) {
  const options = [];
  const now = new Date();
  for (let i = 0; i < totalMonths; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = `${["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][d.getMonth()]} ${d.getFullYear()}`;
    options.push({ value, label });
  }
  return options;
}

function getDefaultRange() {
  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth() - 2, 1);
  return {
    from: `${from.getFullYear()}-${String(from.getMonth() + 1).padStart(2, "0")}`,
    to: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`,
  };
}

function ChartCard({ title, subtitle, children }) {
  return (
    <div className="card" style={{ padding: "20px" }}>
      <h3
        style={{
          fontFamily: "Syne",
          fontWeight: 700,
          fontSize: "14px",
          color: "var(--text-primary)",
          marginBottom: "2px",
        }}
      >
        {title}
      </h3>
      {subtitle && (
        <p
          style={{
            fontSize: "12px",
            color: "var(--text-muted)",
            marginBottom: "16px",
          }}
        >
          {subtitle}
        </p>
      )}
      <div style={{ marginTop: subtitle ? "0" : "16px" }}>{children}</div>
    </div>
  );
}

function SummaryBox({ label, value, color, icon }) {
  return (
    <div className="stat-card" style={{ padding: "16px" }}>
      <div
        style={{ fontSize: "28px", fontFamily: "Syne", fontWeight: 800, color }}
      >
        {value}
      </div>
      <div
        style={{
          fontSize: "12px",
          color: "var(--text-muted)",
          fontWeight: 600,
          marginTop: "4px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "4px",
        }}
      >
        {icon} {label}
      </div>
    </div>
  );
}

export default function AnalyticsTab() {
  const MONTH_OPTIONS = generateMonthOptions(24);
  const defaults = getDefaultRange();
  const [fromMonth, setFromMonth] = useState(defaults.from);
  const [toMonth, setToMonth] = useState(defaults.to);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAnalytics = async (from, to) => {
    setLoading(true);
    setError("");
    try {
      const { data: res } = await api.get("/analytics/overview", {
        params: { from, to },
      });
      setData(res);
    } catch (err) {
      setError("Failed to load analytics data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics(fromMonth, toMonth);
  }, []);

  const handleApply = () => {
    if (fromMonth > toMonth) {
      alert("From month cannot be after To month");
      return;
    }
    fetchAnalytics(fromMonth, toMonth);
  };

  const handleReset = () => {
    const d = getDefaultRange();
    setFromMonth(d.from);
    setToMonth(d.to);
    fetchAnalytics(d.from, d.to);
  };

  return (
    <div style={{ animation: "fadeInUp 0.4s ease" }}>
      {/* Date Range Filter */}
      <div
        className="card"
        style={{
          padding: "20px",
          marginBottom: "24px",
          borderColor: "var(--accent)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "14px",
          }}
        >
          <Calendar size={16} style={{ color: "var(--accent)" }} />
          <h3
            style={{
              fontFamily: "Syne",
              fontWeight: 700,
              fontSize: "14px",
              color: "var(--text-primary)",
            }}
          >
            Date Range Filter
          </h3>
          <span
            style={{
              marginLeft: "auto",
              fontSize: "11px",
              background: "var(--accent-light)",
              color: "var(--accent)",
              padding: "3px 10px",
              borderRadius: "100px",
              fontFamily: "Syne",
              fontWeight: 700,
            }}
          >
            Default: Last 3 Months
          </span>
        </div>

        <div
          style={{
            display: "flex",
            gap: "12px",
            flexWrap: "wrap",
            alignItems: "flex-end",
          }}
        >
          <div>
            <label className="label">From Month</label>
            <select
              value={fromMonth}
              onChange={(e) => setFromMonth(e.target.value)}
              className="input"
              style={{ width: "auto", minWidth: "160px" }}
            >
              {MONTH_OPTIONS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">To Month</label>
            <select
              value={toMonth}
              onChange={(e) => setToMonth(e.target.value)}
              className="input"
              style={{ width: "auto", minWidth: "160px" }}
            >
              {MONTH_OPTIONS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={handleApply}
            disabled={loading}
            className="btn btn-primary"
            style={{ fontSize: "13px" }}
          >
            {loading ? (
              <span
                style={{ display: "flex", alignItems: "center", gap: "6px" }}
              >
                <div
                  style={{
                    width: 12,
                    height: 12,
                    border: "2px solid rgba(255,255,255,0.3)",
                    borderTopColor: "#fff",
                    borderRadius: "50%",
                    animation: "spin 0.8s linear infinite",
                  }}
                />
                Loading...
              </span>
            ) : (
              "📊 Apply"
            )}
          </button>
          <button
            onClick={handleReset}
            disabled={loading}
            className="btn btn-secondary"
            style={{ fontSize: "13px" }}
          >
            <RefreshCw size={13} /> Reset to 3 Months
          </button>
        </div>

        {data && !loading && (
          <p
            style={{
              marginTop: "12px",
              fontSize: "12px",
              color: "var(--text-muted)",
            }}
          >
            📅 Showing data from{" "}
            <strong style={{ color: "var(--text-primary)" }}>
              {MONTH_OPTIONS.find((m) => m.value === fromMonth)?.label}
            </strong>{" "}
            to{" "}
            <strong style={{ color: "var(--text-primary)" }}>
              {MONTH_OPTIONS.find((m) => m.value === toMonth)?.label}
            </strong>{" "}
            — {data.summary.total} ticket{data.summary.total !== 1 ? "s" : ""}{" "}
            found
          </p>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: "center", padding: "80px 0" }}>
          <div
            style={{
              width: 36,
              height: 36,
              border: "3px solid var(--border)",
              borderTopColor: "var(--accent)",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
              margin: "0 auto 16px",
            }}
          />
          <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>
            Loading analytics...
          </p>
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div
          style={{
            textAlign: "center",
            padding: "60px 20px",
            background: "#fef2f2",
            borderRadius: "16px",
            border: "1px solid #fecaca",
          }}
        >
          <p style={{ color: "#dc2626", fontSize: "14px" }}>❌ {error}</p>
        </div>
      )}

      {/* No data */}
      {!loading && !error && data?.summary.total === 0 && (
        <div
          style={{
            textAlign: "center",
            padding: "60px 20px",
            background: "var(--bg-secondary)",
            borderRadius: "16px",
            border: "1px dashed var(--border)",
          }}
        >
          <div style={{ fontSize: "48px", marginBottom: "12px" }}>📊</div>
          <h3
            style={{
              fontFamily: "Syne",
              fontWeight: 700,
              color: "var(--text-primary)",
              marginBottom: "8px",
            }}
          >
            No data for this range
          </h3>
          <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>
            No tickets were raised in the selected date range. Try a different
            range.
          </p>
        </div>
      )}

      {/* Charts */}
      {!loading && !error && data && data.summary.total > 0 && (
        <>
          {/* Summary */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "14px",
              marginBottom: "28px",
            }}
            className="stagger"
          >
            <SummaryBox
              label="Total Tickets"
              value={data.summary.total}
              color="#3b82f6"
              icon="📋"
            />
            <SummaryBox
              label="Resolved"
              value={data.summary.resolved}
              color="#10b981"
              icon="✅"
            />
            <SummaryBox
              label="Avg Rating"
              value={
                data.summary.avgRating ? `${data.summary.avgRating} ⭐` : "—"
              }
              color="#f59e0b"
              icon="⭐"
            />
          </div>

          {/* Charts grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "16px",
            }}
          >
            <div style={{ gridColumn: "1 / -1" }}>
              <ChartCard
                title="Tickets Raised per Month"
                subtitle="Total complaints submitted each month"
              >
                <TicketsPerMonthChart data={data.ticketsPerMonth} />
              </ChartCard>
            </div>
            <ChartCard
              title="Breakdown by Category"
              subtitle="Which types of issues are most common"
            >
              <CategoryPieChart data={data.categoryBreakdown} />
            </ChartCard>
            <ChartCard
              title="Peak Complaint Days"
              subtitle="Which days of the week have most complaints"
            >
              <PeakDaysChart data={data.peakDays} />
            </ChartCard>
            <div style={{ gridColumn: "1 / -1" }}>
              <ChartCard
                title="Average Resolution Time by Category"
                subtitle="How long it takes to resolve each type (hours)"
              >
                <ResolutionTimeChart data={data.resolutionTime} />
              </ChartCard>
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <ChartCard
                title="Most Complained Rooms"
                subtitle="Top 10 rooms by number of complaints"
              >
                <TopRoomsChart data={data.topRooms} />
              </ChartCard>
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <ChartCard
                title="Resident Satisfaction Scores"
                subtitle={`${data.summary.rated} rating${data.summary.rated !== 1 ? "s" : ""} submitted out of ${data.summary.resolved} resolved tickets`}
              >
                <SatisfactionChart
                  byCategory={data.satisfactionByCategory}
                  byMonth={data.satisfactionByMonth}
                />
              </ChartCard>
            </div>
          </div>
        </>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
