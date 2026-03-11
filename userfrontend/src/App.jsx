import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "./context/ThemeContext";

/* AUTH */
import GuestLogin from "./auth/pages/GuestLogin";
import ProfileDetails from "./auth/pages/ProfileDetails";


/* APP PAGES */
import Menu from "./pages/Menu";
import CategoryDetail from "./pages/CategoryDetail";
import Cart from "./pages/Cart";
import OrderConfirmation from "./pages/OrderConfirmation";
import OrderTracking from "./pages/OrderTracking";
import Profile from "./pages/Profile";
import ProfileView from "./pages/ProfileView";
import Support from "./pages/Support";
import Bill from "./pages/Bill";
import OrderHistory from "./pages/OrderHistory";
import Payment from "./pages/Payment";
import Landing from "./pages/Landing";
import Offers from "./pages/Offers";
import OfferDetails from "./pages/OfferDetails";

import { useTheme } from "./context/ThemeContext";
import GlobalTransition from "./components/GlobalTransition";

function AppContent() {
  const { theme } = useTheme();

  return (
    <div className={`min-h-screen w-full transition-colors duration-500 ${theme.bg}`}>
      <GlobalTransition />
      <Toaster position="bottom-center" toastOptions={{ duration: 2000 }} />
      <Routes>

        {/* ✅ DEFAULT ROUTE — FIXES YOUR WARNING */}
        {/* ✅ LANDING / QR HANDLER */}
        <Route path="/" element={<Landing />} />

        {/* AUTH FLOW */}
        <Route path="/login" element={<GuestLogin />} />
        <Route path="/sign-up" element={<Navigate to="/login" replace />} />
        <Route path="/forgot-password" element={<Navigate to="/login" replace />} />
        <Route path="/profile-details" element={<ProfileDetails />} />

        {/* MAIN APP */}
        <Route path="/menu" element={<Menu />} />
        <Route path="/menu/:categoryId" element={<CategoryDetail />} />
        <Route path="/offers" element={<Offers />} />
        <Route path="/offers/:id" element={<OfferDetails />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/order-confirmation" element={<OrderConfirmation />} />
        <Route path="/order-tracking" element={<OrderTracking />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/profile/view" element={<ProfileView />} />
        <Route path="/support" element={<Support />} />
        <Route path="/bill" element={<Bill />} />
        <Route path="/orders" element={<OrderHistory />} />

        {/* OPTIONAL */}
        <Route path="/payment" element={<Payment />} />

        {/* FALLBACK */}
        <Route path="*" element={<Navigate to="/menu" replace />} />

      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
