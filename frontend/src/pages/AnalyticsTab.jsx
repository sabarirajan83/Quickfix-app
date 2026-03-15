import { useState, useEffect } from "react";
import api from "../utils/api";
import TicketsPerMonthChart from "../components/charts/TicketsPerMonthChart";
import CategoryPieChart from "../components/charts/CategoryPieChart";
import ResolutionTimeChart from "../components/charts/ResolutionTimeChart";
import TopRoomsChart from "../components/charts/TopRoomsChart";
import PeakDaysChart from "../components/charts/PeakDaysChart";
import SatisfactionChart from "../components/charts/SatisfactionChart";

// Reusable chart card wrapper
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

// Summary stat box
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
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const { data: res } = await api.get("/analytics/overview");
        setData(res);
      } catch (err) {
        setError("Failed to load analytics data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading)
    return (
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
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );

  if (error)
    return (
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
    );

  return (
    <div style={{ animation: "fadeInUp 0.4s ease" }}>
      {/* Summary row */}
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
          value={data.summary.avgRating ? `${data.summary.avgRating} ⭐` : "—"}
          color="#f59e0b"
          icon="⭐"
        />
      </div>

      {/* Charts grid */}
      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}
      >
        {/* Tickets per month — full width */}
        <div style={{ gridColumn: "1 / -1" }}>
          <ChartCard
            title="Tickets Raised per Month"
            subtitle="Total complaints submitted each month"
          >
            <TicketsPerMonthChart data={data.ticketsPerMonth} />
          </ChartCard>
        </div>

        {/* Category breakdown */}
        <ChartCard
          title="Breakdown by Category"
          subtitle="Which types of issues are most common"
        >
          <CategoryPieChart data={data.categoryBreakdown} />
        </ChartCard>

        {/* Peak days */}
        <ChartCard
          title="Peak Complaint Days"
          subtitle="Which days of the week have most complaints"
        >
          <PeakDaysChart data={data.peakDays} />
        </ChartCard>

        {/* Resolution time — full width */}
        <div style={{ gridColumn: "1 / -1" }}>
          <ChartCard
            title="Average Resolution Time by Category"
            subtitle="How long it takes to resolve each type of issue (hours)"
          >
            <ResolutionTimeChart data={data.resolutionTime} />
          </ChartCard>
        </div>

        {/* Top rooms — full width */}
        <div style={{ gridColumn: "1 / -1" }}>
          <ChartCard
            title="Most Complained Rooms"
            subtitle="Top 10 rooms by number of complaints raised"
          >
            <TopRoomsChart data={data.topRooms} />
          </ChartCard>
        </div>

        {/* Satisfaction — full width */}
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
    </div>
  );
}
