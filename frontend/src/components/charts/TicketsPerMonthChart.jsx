import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function TicketsPerMonthChart({ data }) {
  if (!data?.length) return <EmptyChart message="No ticket data yet" />;
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart
        data={data}
        margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis
          dataKey="month"
          tick={{
            fontSize: 11,
            fill: "var(--text-muted)",
            fontFamily: "DM Sans",
          }}
        />
        <YAxis
          tick={{
            fontSize: 11,
            fill: "var(--text-muted)",
            fontFamily: "DM Sans",
          }}
          allowDecimals={false}
        />
        <Tooltip
          contentStyle={{
            background: "var(--bg-secondary)",
            border: "1px solid var(--border)",
            borderRadius: "10px",
            fontSize: "12px",
          }}
          cursor={{ fill: "var(--bg-tertiary)" }}
        />
        <Bar
          dataKey="count"
          name="Tickets"
          fill="#3b82f6"
          radius={[6, 6, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

function EmptyChart({ message }) {
  return (
    <div
      style={{
        height: 220,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>{message}</p>
    </div>
  );
}
