import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";

import StaffLayout from "./components/layout/StaffLayout";
import OrderManagement from "./pages/staff/OrderManagement";
import QuickBill from "./pages/staff/QuickBill";

import MenuSelection from "./pages/staff/MenuSelection";
import Cart from "./pages/staff/Cart";
import Profile from "./pages/staff/Profile";
import ProfileView from "./pages/staff/ProfileView";
import Support from "./pages/staff/Support";
import Events from "./pages/staff/Events";

import TableRoomSelect from "./pages/staff/TableRoomSelect";
import SignUp from "./pages/auth/SignUp";
import Login from "./pages/auth/Login";

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Toaster position="bottom-center" toastOptions={{ duration: 2000 }} />
        <Routes>
          {/* DEFAULT REDIRECT */}
          <Route path="/" element={<Navigate to="/staff/orders" />} />
          <Route path="/quick-bill" element={<Navigate to="/staff/quick-bill" />} />

          {/* AUTH ROUTES */}
          <Route path="/staff/signup" element={<SignUp />} />
          <Route path="/staff/login" element={<Login />} />

          {/* STAFF ROUTES */}
          <Route element={<StaffLayout />}>
            <Route path="/staff/orders" element={<OrderManagement />} />
            <Route path="/staff/quick-bill" element={<QuickBill />} />
            <Route path="/staff/menu" element={<MenuSelection />} />
            <Route path="/staff/profile" element={<Profile />} />
            <Route path="/staff/profile-view" element={<ProfileView />} />
            <Route path="/staff/cart" element={<Cart />} />
            <Route path="/staff/support" element={<Support />} />
            <Route path="/staff/events" element={<Events />} />
            <Route path="/staff/table-room" element={<TableRoomSelect />} />
          </Route>

          {/* FALLBACK */}
          <Route path="*" element={<Navigate to="/staff/orders" />} />
        </Routes>
      </CartProvider>
    </AuthProvider>
  );
}
