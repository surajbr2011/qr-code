import { createContext, useContext, useState, useEffect } from "react";
import socket from "../utils/socket";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // logged-in user profile

  /* ================= ACTIONS ================= */

  // Load user on mount
  useEffect(() => {
    const token = localStorage.getItem("customer_token");
    if (token) {
      // Fetch profile
      // We need 'api' imported but 'api.js' might trigger circular dep if it uses useAuth?
      // Usually api.js uses localStorage directly so it's fine.
      // Let's import api dynamically or assuming it's safe.
      // For simplicity, I'll fetch here.
      fetchProfile();
    }
  }, []);

  const fetchProfile = async () => {
    try {
      // Dynamic import or just standard fetch to avoid circular dep risks if any
      const token = localStorage.getItem("customer_token");
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data);
        // Connect socket after successful profile fetch
        if (token) {
          socket.auth = { token };
          socket.connect();
        }
      } else {
        // Token invalid?
        logout();
      }
    } catch (err) {
      console.error("Auth load error", err);
    }
  };

  const login = (userData, token, refreshToken) => {
    localStorage.setItem("customer_token", token);
    if (refreshToken) localStorage.setItem("customer_refreshToken", refreshToken);
    setUser(userData);

    // Connect socket
    socket.auth = { token };
    socket.connect();
  };

  const setUserProfile = (profileData) => {
    setUser(profileData);
  };

  const logout = () => {
    localStorage.removeItem("customer_token");
    localStorage.removeItem("customer_refreshToken");
    setUser(null);
    socket.disconnect();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        setUserProfile,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/* ================= HOOK ================= */

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
