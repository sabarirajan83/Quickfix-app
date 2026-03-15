import { useState, useEffect } from "react";
import api from "../utils/api";
import { Plus, X, Users, Trash2 } from "lucide-react";

export default function StaffManager() {
  const [staff, setStaff] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    specialty: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const SPECIALTIES = [
    "Plumber",
    "Electrician",
    "Carpenter",
    "Cleaner",
    "Network Tech",
    "General",
  ];

  const fetchStaff = async () => {
    try {
      const { data } = await api.get("/staff");
      setStaff(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      await api.post("/staff/create", form);
      setMessage("success");
      setForm({ name: "", email: "", password: "", specialty: "" });
      setShowForm(false);
      fetchStaff();
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to create staff");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <h3
          style={{
            fontFamily: "Syne",
            fontWeight: 700,
            fontSize: "16px",
            color: "var(--text-primary)",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <Users size={16} style={{ color: "var(--accent)" }} />
          Maintenance Staff ({staff.length})
        </h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn btn-primary"
          style={{ padding: "8px 14px", fontSize: "12px" }}
        >
          {showForm ? <X size={13} /> : <Plus size={13} />}
          {showForm ? "Cancel" : "Add Staff"}
        </button>
      </div>

      {/* Success message */}
      {message === "success" && (
        <div
          style={{
            background: "var(--resolved-bg)",
            border: "1px solid #10b981",
            borderRadius: "10px",
            padding: "10px 14px",
            marginBottom: "16px",
            color: "#10b981",
            fontSize: "13px",
          }}
        >
          ✅ Staff member created successfully!
        </div>
      )}
      {message && message !== "success" && (
        <div
          style={{
            background: "#fef2f2",
            border: "1px solid #fecaca",
            borderRadius: "10px",
            padding: "10px 14px",
            marginBottom: "16px",
            color: "#dc2626",
            fontSize: "13px",
          }}
        >
          ❌ {message}
        </div>
      )}

      {/* Create form */}
      {showForm && (
        <div
          className="card"
          style={{
            padding: "20px",
            marginBottom: "20px",
            borderColor: "var(--accent)",
            animation: "fadeInUp 0.3s ease",
          }}
        >
          <h4
            style={{
              fontFamily: "Syne",
              fontWeight: 700,
              fontSize: "14px",
              color: "var(--text-primary)",
              marginBottom: "16px",
            }}
          >
            Create Staff Account
          </h4>
          <form
            onSubmit={handleCreate}
            style={{ display: "flex", flexDirection: "column", gap: "12px" }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "12px",
              }}
            >
              <div>
                <label className="label">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Ravi Kumar"
                  required
                  className="input"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div>
                <label className="label">Specialty</label>
                <select
                  className="input"
                  value={form.specialty}
                  onChange={(e) =>
                    setForm({ ...form, specialty: e.target.value })
                  }
                >
                  <option value="">Select specialty...</option>
                  {SPECIALTIES.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "12px",
              }}
            >
              <div>
                <label className="label">Email</label>
                <input
                  type="email"
                  placeholder="staff@quickfix.com"
                  required
                  className="input"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
              <div>
                <label className="label">Password</label>
                <input
                  type="password"
                  placeholder="Min 6 characters"
                  required
                  className="input"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                />
              </div>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "10px",
              }}
            >
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
              >
                {loading ? "Creating..." : "Create Staff Account"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Staff list */}
      {staff.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "40px",
            background: "var(--bg-tertiary)",
            borderRadius: "12px",
          }}
        >
          <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>
            No staff members yet. Add one above!
          </p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
            gap: "12px",
          }}
        >
          {staff.map((s) => (
            <div
              key={s._id}
              className="card"
              style={{
                padding: "16px",
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  background: "var(--accent)",
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "Syne",
                  fontWeight: 800,
                  color: "#fff",
                  fontSize: "16px",
                }}
              >
                {s.name?.charAt(0).toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p
                  style={{
                    fontFamily: "Syne",
                    fontWeight: 700,
                    fontSize: "14px",
                    color: "var(--text-primary)",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {s.name}
                </p>
                <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                  {s.specialty || "General"}
                </p>
                <p
                  style={{
                    fontSize: "11px",
                    color: "var(--text-muted)",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {s.email}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
