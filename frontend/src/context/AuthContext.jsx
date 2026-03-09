import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Only load user from storage once on mount
    try {
      const stored = localStorage.getItem("quickfix_user");
      if (stored) {
        const parsed = JSON.parse(stored);
        // Validate that stored user has required fields
        if (parsed?.token && parsed?.role) {
          setUser(parsed);
        } else {
          localStorage.removeItem("quickfix_user");
        }
      }
    } catch (e) {
      localStorage.removeItem("quickfix_user");
    } finally {
      setLoading(false);
    }
  }, []);

  const login = (userData) => {
    localStorage.setItem("quickfix_user", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("quickfix_user");
    setUser(null);
  };

  // Don't render anything until we've checked localStorage
  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400 text-sm">Loading...</p>
      </div>
    );

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
