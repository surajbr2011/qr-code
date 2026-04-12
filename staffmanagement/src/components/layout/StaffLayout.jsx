import { Outlet, Navigate } from "react-router-dom";
import Header from "./Header";
import BottomNav from "./BottomNav";
import { useAuth } from "../../context/AuthContext";

export default function StaffLayout() {
  const { user, loading } = useAuth();

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Loading...</div>;

  if (!user) {
    return <Navigate to="/staff/login" replace />;
  }

  // ENFORCE STAFF ROLE
  const staffRoles = ['admin', 'manager', 'waiter', 'kitchen'];
  if (!staffRoles.includes(user.role)) {
    return <Navigate to="/staff/login" replace />;
  }

  return (
    <div className="fixed inset-0 bg-black flex justify-center">
      {/* MOBILE FRAME */}
      <div className="w-full max-w-[430px] bg-white flex flex-col h-full overflow-hidden">

        {/* PAGE CONTENT */}
        <main className="flex-1 overflow-y-auto scrollbar-hide">
          <Outlet />
        </main>

        {/* BOTTOM NAV */}
        <div className="shrink-0 bg-white border-t border-gray-100 z-50">
          <BottomNav />
        </div>
      </div>
    </div>
  );
}
