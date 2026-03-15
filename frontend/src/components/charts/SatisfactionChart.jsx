import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function SatisfactionChart({ byCategory, byMonth }) {
  const hasCategory = byCategory?.length > 0;
  const hasMonth = byMonth?.length > 0;

  if (!hasCategory && !hasMonth)
    return <EmptyChart message="No ratings submitted yet" />;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* By Category */}
      {hasCategory && (
        <div>
          <p
            style={{
              fontSize: "12px",
              fontWeight: 600,
              color: "var(--text-muted)",
              fontFamily: "Syne",
              textTransform: "uppercase",
              marginBottom: "10px",
            }}
          >
            Avg Rating by Category
          </p>
          <ResponsiveContainer width="100%" height={180}>
            <ComposedChart
              data={byCategory}
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
                domain={[0, 5]}
                tick={{
                  fontSize: 11,
                  fill: "var(--text-muted)",
                  fontFamily: "DM Sans",
                }}
              />
              <Tooltip
                contentStyle={{
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border)",
                  borderRadius: "10px",
                  fontSize: "12px",
                }}
                formatter={(v, n) => [
                  n === "avgRating" ? `${v} ⭐` : v,
                  n === "avgRating" ? "Avg Rating" : "Responses",
                ]}
                cursor={{ fill: "var(--bg-tertiary)" }}
              />
              <Legend
                wrapperStyle={{ fontSize: "11px", fontFamily: "DM Sans" }}
              />
              <Bar
                dataKey="count"
                name="Responses"
                fill="#e2e8f0"
                radius={[4, 4, 0, 0]}
              />
              <Line
                dataKey="avgRating"
                name="Avg Rating"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={{ fill: "#f59e0b", r: 4 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* By Month */}
      {hasMonth && (
        <div>
          <p
            style={{
              fontSize: "12px",
              fontWeight: 600,
              color: "var(--text-muted)",
              fontFamily: "Syne",
              textTransform: "uppercase",
              marginBottom: "10px",
            }}
          >
            Avg Rating by Month
          </p>
          <ResponsiveContainer width="100%" height={180}>
            <ComposedChart
              data={byMonth}
              margin={{ top: 5, right: 10, left: -10, bottom: 5 }}
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
                domain={[0, 5]}
                tick={{
                  fontSize: 11,
                  fill: "var(--text-muted)",
                  fontFamily: "DM Sans",
                }}
              />
              <Tooltip
                contentStyle={{
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border)",
                  borderRadius: "10px",
                  fontSize: "12px",
                }}
                formatter={(v) => [`${v} ⭐`, "Avg Rating"]}
                cursor={{ fill: "var(--bg-tertiary)" }}
              />
              <Line
                dataKey="avgRating"
                name="Avg Rating"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ fill: "#10b981", r: 4 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

function EmptyChart({ message }) {
  return (
    <div
      style={{
        height: 180,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>{message}</p>
    </div>
  );
}
