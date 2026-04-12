import { createContext, useContext, useState, useEffect } from "react";
import api from "../utils/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("staff_token");
        const storedUser = localStorage.getItem("staff_user");
        if (token && storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const { data } = await api.post("/auth/staff-login", { email, password });

            // ROLE VERIFICATION
            const staffRoles = ['admin', 'manager', 'waiter', 'kitchen'];
            if (!staffRoles.includes(data.role)) {
                throw new Error("Access Denied: Not a staff account");
            }

            localStorage.setItem("staff_token", data.accessToken);
            localStorage.setItem("staff_user", JSON.stringify(data));
            setUser(data);
            return data;
        } catch (error) {
            const message = error.response?.data?.message || error.message || "Login failed";
            throw message;
        }
    };

    const logout = () => {
        localStorage.removeItem("staff_token");
        localStorage.removeItem("staff_user");
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within AuthProvider");
    return context;
}
