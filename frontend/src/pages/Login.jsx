import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";
import {
  Wrench,
  Mail,
  Lock,
  User,
  ArrowRight,
  Eye,
  EyeOff,
} from "lucide-react";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTimeout(() => setMounted(true), 50);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const endpoint = isRegister ? "/auth/register" : "/auth/login";
      const payload = isRegister
        ? form
        : { email: form.email, password: form.password };
      const { data } = await api.post(endpoint, payload);
      login(data);
      navigate(data.role === "admin" ? "/admin" : "/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.message || "Something went wrong. Try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg-primary)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background decoration */}
      <div
        style={{
          position: "absolute",
          top: "-200px",
          right: "-200px",
          width: "600px",
          height: "600px",
          background:
            "radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-200px",
          left: "-200px",
          width: "500px",
          height: "500px",
          background:
            "radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          opacity: mounted ? 1 : 0,
          transform: mounted ? "translateY(0)" : "translateY(24px)",
          transition: "all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div
            style={{
              width: 56,
              height: 56,
              background: "var(--accent)",
              borderRadius: "16px",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 8px 24px rgba(59,130,246,0.4)",
              marginBottom: "16px",
            }}
          >
            <Wrench size={26} color="#fff" />
          </div>
          <h1
            style={{
              fontFamily: "Syne",
              fontWeight: 800,
              fontSize: "28px",
              color: "var(--text-primary)",
              marginBottom: "4px",
            }}
          >
            Quick<span style={{ color: "var(--accent)" }}>Fix</span>
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>
            Campus Maintenance Tracker
          </p>
        </div>

        {/* Card */}
        <div className="card" style={{ padding: "32px" }}>
          {/* Toggle tabs */}
          <div
            style={{
              display: "flex",
              gap: "4px",
              background: "var(--bg-tertiary)",
              borderRadius: "12px",
              padding: "4px",
              marginBottom: "24px",
            }}
          >
            {["Sign In", "Register"].map((t, i) => (
              <button
                key={t}
                onClick={() => {
                  setIsRegister(i === 1);
                  setError("");
                }}
                style={{
                  flex: 1,
                  padding: "10px",
                  borderRadius: "9px",
                  border: "none",
                  fontFamily: "Syne",
                  fontWeight: 700,
                  fontSize: "13px",
                  cursor: "pointer",
                  background:
                    (i === 1) === isRegister
                      ? "var(--bg-secondary)"
                      : "transparent",
                  color:
                    (i === 1) === isRegister
                      ? "var(--accent)"
                      : "var(--text-muted)",
                  boxShadow:
                    (i === 1) === isRegister ? "var(--shadow)" : "none",
                  transition: "all 0.2s ease",
                }}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Error */}
          {error && (
            <div
              style={{
                background: "#fef2f2",
                border: "1px solid #fecaca",
                borderRadius: "10px",
                padding: "12px 14px",
                marginBottom: "16px",
                fontSize: "13px",
                color: "#dc2626",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              ⚠️ {error}
            </div>
          )}

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: "14px" }}
          >
            {isRegister && (
              <div style={{ position: "relative" }}>
                <label className="label">Full Name</label>
                <div style={{ position: "relative" }}>
                  <User
                    size={15}
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
                    placeholder="Your full name"
                    required
                    className="input"
                    style={{ paddingLeft: "40px" }}
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="label">Email Address</label>
              <div style={{ position: "relative" }}>
                <Mail
                  size={15}
                  style={{
                    position: "absolute",
                    left: 14,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--text-muted)",
                  }}
                />
                <input
                  type="email"
                  placeholder="you@email.com"
                  required
                  className="input"
                  style={{ paddingLeft: "40px" }}
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="label">Password</label>
              <div style={{ position: "relative" }}>
                <Lock
                  size={15}
                  style={{
                    position: "absolute",
                    left: 14,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--text-muted)",
                  }}
                />
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="••••••••"
                  required
                  className="input"
                  style={{ paddingLeft: "40px", paddingRight: "44px" }}
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{
                    position: "absolute",
                    right: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--text-muted)",
                    padding: 4,
                  }}
                >
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: "100%", marginTop: "4px", padding: "13px" }}
            >
              {loading ? (
                <span
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <svg
                    style={{
                      animation: "spin 1s linear infinite",
                      width: 16,
                      height: 16,
                    }}
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeDasharray="40"
                      strokeDashoffset="10"
                    />
                  </svg>
                  Please wait...
                </span>
              ) : (
                <span
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  {isRegister ? "Create Account" : "Sign In"}
                  <ArrowRight size={16} />
                </span>
              )}
            </button>
          </form>
        </div>

        <p
          style={{
            textAlign: "center",
            marginTop: "16px",
            fontSize: "12px",
            color: "var(--text-muted)",
          }}
        >
          Secure login powered by JWT authentication
        </p>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
