import { useState, useEffect } from "react";
import api from "../utils/api";
import { UserCheck, ChevronDown } from "lucide-react";

export default function StaffAssignDropdown({ ticket, onAssigned }) {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchStaff = async () => {
      setLoading(true);
      try {
        const { data } = await api.get("/staff");
        setStaffList(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStaff();
  }, []);

  const handleAssign = async (staffId) => {
    setSaving(true);
    try {
      const { data } = await api.put(`/staff/assign/${ticket._id}`, {
        staffId: staffId === "unassign" ? null : staffId,
      });
      if (onAssigned) onAssigned(data);
    } catch (err) {
      alert("Failed to assign staff");
    } finally {
      setSaving(false);
    }
  };

  const assigned = ticket.assignedTo;

  return (
    <div style={{ marginTop: "10px" }}>
      <label
        style={{
          display: "block",
          fontSize: "11px",
          fontWeight: 700,
          fontFamily: "Syne",
          color: "var(--text-muted)",
          textTransform: "uppercase",
          letterSpacing: "0.04em",
          marginBottom: "6px",
        }}
      >
        Assign To
      </label>

      {/* Currently assigned pill */}
      {assigned && (
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            background: "var(--accent-light)",
            border: "1px solid var(--accent)",
            borderRadius: "100px",
            padding: "4px 12px",
            fontSize: "12px",
            color: "var(--accent)",
            fontWeight: 600,
            marginBottom: "8px",
          }}
        >
          <UserCheck size={12} />
          {assigned.name}
          {assigned.specialty && ` — ${assigned.specialty}`}
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <div style={{ position: "relative", flex: 1 }}>
          <select
            onChange={(e) => handleAssign(e.target.value)}
            defaultValue=""
            disabled={loading || saving}
            className="input"
            style={{ paddingRight: "36px", fontSize: "13px" }}
          >
            <option value="" disabled>
              {loading
                ? "Loading staff..."
                : assigned
                  ? "Reassign to..."
                  : "Assign to staff..."}
            </option>
            {assigned && <option value="unassign">— Remove assignment</option>}
            {staffList.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name}
                {s.specialty ? ` — ${s.specialty}` : ""}
              </option>
            ))}
          </select>
        </div>
        {saving && (
          <div
            style={{
              width: 16,
              height: 16,
              border: "2px solid var(--border)",
              borderTopColor: "var(--accent)",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
              flexShrink: 0,
            }}
          />
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
