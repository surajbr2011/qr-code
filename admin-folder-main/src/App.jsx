import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Loading from "./components/ui/Loading";
import { AuthProvider } from "./context/AuthContext";
import { HotelProvider } from "./context/HotelContext";
import { CartProvider } from "./context/CartContext";
import ProtectedRoute from "./components/ProtectedRoute";
import { Toaster } from "react-hot-toast";

// Lazy Load Pages
const Login = lazy(() => import("./pages/Login"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Tables = lazy(() => import("./pages/Tables"));
const Menu = lazy(() => import("./pages/Menu"));
const Receipt = lazy(() => import("./pages/Receipt"));
const ExpenseTracking = lazy(() => import("./pages/ExpenseTracking"));
const MenuManagement = lazy(() => import("./pages/MenuManagement"));
const StaffManagement = lazy(() => import("./pages/StaffManagement"));
const Reports = lazy(() => import("./pages/Reports"));
const Support = lazy(() => import("./pages/Support"));
const OrderTracking = lazy(() => import("./pages/OrderTracking"));
const GeneralSetting = lazy(() => import("./pages/GeneralSetting"));
const ProfileView = lazy(() => import("./pages/ProfileView"));

const OrderManagement = lazy(() => import("./pages/OrderManagement"));
const QrCodeManagement = lazy(() => import("./pages/QrCodeManagement"));

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <HotelProvider>
          <CartProvider>
            <Toaster position="top-center" reverseOrder={false} />
            <Suspense fallback={<Loading />}>
              <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<Login />} />

                {/* Protected Routes */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/" element={<Navigate to="/dashboard" />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/tables" element={<Tables />} />
                  <Route path="/menu" element={<Menu />} />
                  <Route path="/receipt" element={<Receipt />} />
                  <Route path="/expenses" element={<ExpenseTracking />} />
                  <Route path="/menu-management" element={<MenuManagement />} />
                  <Route path="/staff" element={<StaffManagement />} />
                  <Route path="/reports" element={<Reports />} />
                  <Route path="/qr" element={<QrCodeManagement />} />

                  <Route path="/support" element={<Support />} />
                  <Route path="/orders" element={<OrderTracking />} />
                  <Route path="/profile" element={<ProfileView />} />
                  <Route path="/general" element={<GeneralSetting />} />
                  <Route path="/order" element={<OrderManagement />} />
                </Route>

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/dashboard" />} />
              </Routes>
            </Suspense>
          </CartProvider>
        </HotelProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
