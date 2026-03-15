import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function ResolutionTimeChart({ data }) {
  if (!data?.length) return <EmptyChart message="No resolved tickets yet" />;
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart
        data={data}
        margin={{ top: 5, right: 10, left: -10, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis
          dataKey="category"
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
          unit="h"
        />
        <Tooltip
          contentStyle={{
            background: "var(--bg-secondary)",
            border: "1px solid var(--border)",
            borderRadius: "10px",
            fontSize: "12px",
          }}
          formatter={(v) => [`${v} hrs`, "Avg Resolution"]}
          cursor={{ fill: "var(--bg-tertiary)" }}
        />
        <Bar
          dataKey="avgHours"
          name="Avg Hours"
          fill="#10b981"
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
