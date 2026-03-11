import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Loading from "./ui/Loading";

export default function ProtectedRoute() {
    const { user, loading } = useAuth();

    if (loading) return <Loading />;

    // If not authenticated, redirect to login
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // If authenticated, render child routes
    return <Outlet />;
}
