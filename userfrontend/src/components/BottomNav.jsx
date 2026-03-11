import { useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { motion } from "framer-motion";
import { Home, ShoppingBag, User, ReceiptText } from "lucide-react";

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, isAvengerMode } = useTheme();

  const tabs = [
    { id: "home", path: "/menu", icon: Home, label: "Home" },
    { id: "bill", path: "/bill", icon: ReceiptText, label: "Bill" },
    { id: "cart", path: "/cart", icon: ShoppingBag, label: "Cart" },
    { id: "profile", path: "/profile", icon: User, label: "Profile" },
  ];

  return (
    <div className={`fixed bottom-0 left-0 right-0 z-50 border-t backdrop-blur-xl
      ${isAvengerMode ? 'bg-slate-900/95 border-slate-800' : 'bg-white/95 border-gray-100'}`}>

      <nav className="w-full max-w-[430px] mx-auto flex items-center justify-around h-[64px]">
        {tabs.map((tab) => {
          const isActive = location.pathname.startsWith(tab.path);
          const Icon = tab.icon;

          return (
            <div key={tab.id} className="relative flex-1 h-full">
              <button
                onClick={() => navigate(tab.path)}
                className="w-full h-full flex flex-col items-center justify-center relative z-10"
              >
                <div className={`transition-colors duration-300 ${isActive ? (isAvengerMode ? 'text-red-500' : 'text-orange-500') : (isAvengerMode ? 'text-slate-500' : 'text-gray-400')}`}>
                  <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                </div>
              </button>

              {/* Active Indicator Top Border - Minimalist & Flush */}
              {isActive && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className={`absolute top-0 left-0 right-0 h-[2px] ${isAvengerMode ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.6)]' : 'bg-orange-500'}`}
                  initial={false}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </div>
          );
        })}
      </nav>
    </div>
  );
}
