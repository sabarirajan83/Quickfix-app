import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-blue-700 text-white px-6 py-4 flex justify-between items-center shadow-md">
      <Link to="/" className="text-xl font-bold tracking-wide">
        🔧 QuickFix
      </Link>
      {user && (
        <div className="flex items-center gap-6">
          <span className="text-sm">Hi, {user.name}</span>
          {user.role === "admin" && (
            <Link to="/admin" className="text-sm underline hover:text-blue-200">
              Admin Panel
            </Link>
          )}
          <button
            onClick={handleLogout}
            className="bg-white text-blue-700 px-3 py-1 rounded font-semibold text-sm hover:bg-blue-100 transition"
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}
