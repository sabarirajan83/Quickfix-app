import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function TopRoomsChart({ data }) {
  if (!data?.length) return <EmptyChart message="No room data yet" />;
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="var(--border)"
          horizontal={false}
        />
        <XAxis
          type="number"
          tick={{
            fontSize: 11,
            fill: "var(--text-muted)",
            fontFamily: "DM Sans",
          }}
          allowDecimals={false}
        />
        <YAxis
          dataKey="room"
          type="category"
          tick={{
            fontSize: 11,
            fill: "var(--text-muted)",
            fontFamily: "DM Sans",
          }}
          width={55}
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
          name="Complaints"
          fill="#f59e0b"
          radius={[0, 6, 6, 0]}
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
