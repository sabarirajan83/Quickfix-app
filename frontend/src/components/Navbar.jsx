import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";
import { Sun, Moon, LogOut, Wrench, LayoutDashboard } from "lucide-react";
import NotificationBell from "./NotificationBell";

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [dark, setDark] = useState(
    () => localStorage.getItem("qf_theme") === "dark",
  );
  const [scrolled, setScrolled] = useState(false);

  const isLoginPage = location.pathname === "/login";

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("qf_theme", dark ? "dark" : "light");
  }, [dark]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav
      style={{
        background: scrolled ? "var(--bg-secondary)" : "transparent",
        borderBottom: scrolled
          ? "1px solid var(--border)"
          : "1px solid transparent",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        boxShadow: scrolled ? "var(--shadow)" : "none",
        position: "sticky",
        top: 0,
        zIndex: 100,
        transition: "all 0.3s ease",
        padding: "0 24px",
        height: "64px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      {/* Logo */}
      <Link
        to="/"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          textDecoration: "none",
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            background: "var(--accent)",
            borderRadius: "10px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 12px rgba(59,130,246,0.4)",
          }}
        >
          <Wrench size={18} color="#fff" />
        </div>
        <span
          style={{
            fontFamily: "Syne",
            fontWeight: 800,
            fontSize: "18px",
            color: "var(--text-primary)",
          }}
        >
          Quick<span style={{ color: "var(--accent)" }}>Fix</span>
        </span>
      </Link>

      {/* Right side */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        {/* Dark mode toggle */}
        <button
          onClick={() => setDark(!dark)}
          style={{
            padding: "8px",
            borderRadius: "10px",
            width: 38,
            height: 38,
            background: "transparent",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          title={dark ? "Light mode" : "Dark mode"}
        >
          {dark ? (
            <Sun size={16} style={{ color: "var(--text-secondary)" }} />
          ) : (
            <Moon size={16} style={{ color: "var(--text-secondary)" }} />
          )}
        </button>

        {user && !isLoginPage && (
          <>
            {/* Admin link */}
            {user.role === "admin" && (
              <Link
                to="/admin"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "8px 14px",
                  borderRadius: "10px",
                  textDecoration: "none",
                  fontSize: "13px",
                  fontFamily: "Syne",
                  fontWeight: 600,
                  color:
                    location.pathname === "/admin"
                      ? "var(--accent)"
                      : "var(--text-secondary)",
                  background:
                    location.pathname === "/admin"
                      ? "var(--accent-light)"
                      : "transparent",
                }}
              >
                <LayoutDashboard size={14} /> Admin
              </Link>
            )}

            {/* Staff link */}
            {user.role === "staff" && (
              <Link
                to="/staff"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "8px 14px",
                  borderRadius: "10px",
                  textDecoration: "none",
                  fontSize: "13px",
                  fontFamily: "Syne",
                  fontWeight: 600,
                  color:
                    location.pathname === "/staff"
                      ? "var(--accent)"
                      : "var(--text-secondary)",
                  background:
                    location.pathname === "/staff"
                      ? "var(--accent-light)"
                      : "transparent",
                }}
              >
                <Wrench size={14} /> My Tickets
              </Link>
            )}

            {/* Notification Bell */}
            <NotificationBell />

            {/* User pill */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                background: "var(--bg-tertiary)",
                border: "1px solid var(--border)",
                borderRadius: "100px",
                padding: "6px 14px 6px 8px",
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  background: "var(--accent)",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "#fff",
                  fontFamily: "Syne",
                }}
              >
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <span
                style={{
                  fontSize: "13px",
                  fontWeight: 500,
                  color: "var(--text-primary)",
                }}
              >
                {user.name?.split(" ")[0]}
              </span>
              <span
                style={{
                  fontSize: "10px",
                  fontWeight: 700,
                  background:
                    user.role === "admin"
                      ? "var(--accent)"
                      : user.role === "staff"
                        ? "#8b5cf6"
                        : "var(--resolved)",
                  color: "#fff",
                  padding: "2px 7px",
                  borderRadius: "100px",
                  fontFamily: "Syne",
                  textTransform: "uppercase",
                }}
              >
                {user.role}
              </span>
            </div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              style={{
                padding: "8px",
                width: 38,
                height: 38,
                background: "transparent",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "10px",
              }}
              title="Logout"
            >
              <LogOut size={16} style={{ color: "var(--text-secondary)" }} />
            </button>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
