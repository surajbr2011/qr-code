import {
  FiArrowLeft,
  FiChevronRight,
  FiUser,
  FiFileText,
  FiMapPin,
  FiClock,
  FiCreditCard,
  FiHelpCircle,
  FiLogOut
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import PageWrapper from "../components/PageWrapper";
import BottomNav from "../components/BottomNav";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useTheme } from "../context/ThemeContext";
import api from "../utils/api";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

/* ---------- REUSABLE LIST ITEM ---------- */
function ProfileItem({ label, icon: Icon, onClick, subLabel, isDestructive, theme, isAvengerMode }) {
  // Styles based on mode
  const baseBg = isAvengerMode ? "bg-slate-800 border-slate-700" : "bg-white border-gray-100";
  const hoverBg = isAvengerMode ? "#1e293b" : "#F9FAFB"; // slate-800 : gray-50
  const textColor = isAvengerMode ? "text-slate-200" : "text-gray-800";
  const subTextColor = isAvengerMode ? "text-slate-500" : "text-gray-400";
  const iconBg = isDestructive
    ? "bg-red-50 text-red-500"
    : (isAvengerMode ? "bg-slate-700 text-red-500" : "bg-orange-50 text-orange-500");

  return (
    <motion.button
      whileHover={{ scale: 1.02, backgroundColor: isDestructive ? "#FEF2F2" : hoverBg }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all shadow-sm ${baseBg}
        ${isDestructive
          ? "border-red-100 text-red-600"
          : (isAvengerMode ? "hover:border-red-500/30" : "hover:border-orange-200")
        }`}
    >
      <div className="flex items-center gap-3">
        <div className={`p-2.5 rounded-full ${iconBg}`}>
          <Icon size={20} />
        </div>
        <div className="text-left">
          <span className={`block font-semibold text-sm ${isDestructive ? "text-red-600" : textColor}`}>
            {label}
          </span>
          {subLabel && (
            <span className={`text-xs font-medium ${subTextColor}`}>{subLabel}</span>
          )}
        </div>
      </div>
      <FiChevronRight className={`${isDestructive ? "text-red-300" : (isAvengerMode ? "text-slate-600" : "text-gray-300")}`} />
    </motion.button>
  );
}

/* ---------- MAIN PROFILE PAGE ---------- */
export default function Profile() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const { deactivateOffer, clearCart } = useCart();
  const { theme, isAvengerMode } = useTheme();

  const [activeOrders, setActiveOrders] = useState([]);

  useEffect(() => {
    if (user) {
      fetchActiveOrders();
    }
  }, [user]);

  const fetchActiveOrders = async () => {
    try {
      // Logic to fetch active orders if API exists
      // const { data } = await api.get('/orders/my-orders');
      // const active = data.filter(o => !['delivered', 'cancelled'].includes(o.status));
      // setActiveOrders(active);
    } catch (err) {
      console.error(err);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <PageWrapper className={`min-h-screen pb-24 font-sans max-w-[430px] mx-auto transition-colors duration-500 ${theme.bg}`}>

      {/* ===== HEADER ===== */}
      <header className={`sticky top-0 z-20 backdrop-blur-md border-b transition-colors duration-500 ${isAvengerMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white/80 border-gray-100'}`}>
        <div className="relative h-16 flex items-center justify-center px-4">
          <button
            onClick={() => navigate(-1)}
            className={`absolute left-4 p-2 rounded-full active:scale-90 transition ${isAvengerMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            <FiArrowLeft size={20} />
          </button>
          <h1 className={`text-lg font-bold ${theme.text}`}>My Profile</h1>
        </div>
      </header>

      {/* ===== USER INFO ===== */}


      {/* ===== MENU LIST ===== */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="px-4 mt-6 space-y-3"
      >
        <div className={`text-xs font-bold uppercase tracking-wider mb-2 ml-2 ${theme.textSec}`}>Account</div>

        <motion.div variants={itemVariants}>
          <ProfileItem
            label="Personal Details"
            icon={FiUser}
            onClick={() => navigate("/profile/view")}
            subLabel="Edit your profile info"
            theme={theme}
            isAvengerMode={isAvengerMode}
          />
        </motion.div>

        <motion.div variants={itemVariants}>
          <ProfileItem
            label="My Orders"
            icon={FiClock}
            onClick={() => navigate("/orders")}
            subLabel="View past order history"
            theme={theme}
            isAvengerMode={isAvengerMode}
          />
        </motion.div>

        <motion.div variants={itemVariants}>
          <ProfileItem
            label="Order Tracking"
            icon={FiMapPin}
            onClick={() => navigate("/order-tracking")}
            subLabel={activeOrders.length > 0 ? `${activeOrders.length} Active Orders` : "Track live status"}
            theme={theme}
            isAvengerMode={isAvengerMode}
          />
        </motion.div>

        <motion.div variants={itemVariants}>
          <ProfileItem
            label="My Bills"
            icon={FiFileText}
            onClick={() => navigate("/bill")}
            subLabel="Download invoices"
            theme={theme}
            isAvengerMode={isAvengerMode}
          />
        </motion.div>

        <motion.div variants={itemVariants}>
          <ProfileItem
            label="Payments"
            icon={FiCreditCard}
            onClick={() => navigate("/payment")}
            subLabel="Manage payment methods"
            theme={theme}
            isAvengerMode={isAvengerMode}
          />
        </motion.div>

        <div className={`text-xs font-bold uppercase tracking-wider mt-6 mb-2 ml-2 ${theme.textSec}`}>General</div>

        <motion.div variants={itemVariants}>
          <ProfileItem
            label="Help & Support"
            icon={FiHelpCircle}
            onClick={() => navigate("/support")}
            subLabel="FAQs and Contact"
            theme={theme}
            isAvengerMode={isAvengerMode}
          />
        </motion.div>

        <motion.div variants={itemVariants} className="pt-4">
          <ProfileItem
            label="Logout"
            icon={FiLogOut}
            onClick={() => {
              logout();
              deactivateOffer();
              clearCart();
              navigate("/login");
              toast.success("Logged out successfully");
            }}
            isDestructive
            subLabel="Sign out of your account"
            theme={theme}
            isAvengerMode={isAvengerMode}
          />
        </motion.div>

      </motion.div>

      <BottomNav />
    </PageWrapper>
  );
}
