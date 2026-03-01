import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import DashboardStudent from "./pages/DashboardStudent";
import DashboardAdmin from "./pages/DashboardAdmin";
import Navbar from "./components/Navbar";

const PrivateRoute = ({ children, adminRequired }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (adminRequired && user.role !== "admin")
    return <Navigate to="/dashboard" />;
  return children;
};

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <DashboardStudent />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <PrivateRoute adminRequired>
              <DashboardAdmin />
            </PrivateRoute>
          }
        />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}
