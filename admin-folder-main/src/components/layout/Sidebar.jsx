import { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import { useHotel } from "../../context/HotelContext";
import { motion, AnimatePresence } from "framer-motion";

const mainMenu = [
  { label: "Profile", icon: "mdi:account-badge-outline", path: "/profile" },
  { label: "Quick Bill", icon: "mdi:credit-card-outline", path: "/tables" },
  { label: "Receipt", icon: "mdi:cash-register", path: "/receipt" },
  { label: "Order Management", icon: "mdi:chef-hat", path: "/order" },
  { label: "Expense Tracking", icon: "mdi:chart-bar", path: "/expenses" },
  { label: "Reports", icon: "mdi:clipboard-text-outline", path: "/reports" },
  { label: "Menu Management", icon: "mdi:silverware-fork-knife", path: "/menu-management" },
  { label: "Staff Management", icon: "mdi:account-group-outline", path: "/staff" },
  { label: "QR Management", icon: "mdi:qrcode-scan", path: "/qr" },
  { label: "General Setting", icon: "mdi:cog-outline", path: "/general" },
  { label: "Support", icon: "mdi:headset", path: "/support" },
  { label: "Order Tracking", icon: "mdi:clipboard-text-clock-outline", path: "/orders" }
];

export default function Sidebar({ isOpen, onClose }) {
  const [qbModalOpen, setQbModalOpen] = useState(false);
  const navigate = useNavigate();
  const { hotelLogo } = useHotel();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const openQuickBill = (e) => {
    e.preventDefault();
    setQbModalOpen(true);
    // Don't close sidebar on mobile if opening the modal/sheet from it
  };

  const chooseQuickBill = (mode) => {
    setQbModalOpen(false);
    onClose && onClose();

    if (mode === 'takeaway') {
      navigate('/menu', { state: { mode: 'takeaway' } });
    } else {
      navigate('/tables', { state: { mode } });
    }
  };

  // Sidebar Variants
  const sidebarVariants = {
    open: { x: 0 },
    closed: { x: "-100%" },
  };

  return (
    <>
      <motion.aside
        initial={false} // Prevent initial animation on first load if already correct
        animate={isMobile ? (isOpen ? "open" : "closed") : "open"} // Always open on desktop
        variants={sidebarVariants}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={`
          fixed inset-y-0 left-0 z-50 w-[260px] shrink-0 h-screen bg-white border-r border-gray-200 flex flex-col pb-3
          md:relative md:transform-none md:flex
        `}
      >
        {/* LOGO */}
        <div className="flex items-center gap-3 px-4 py-4">
          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center overflow-hidden">
            {hotelLogo ? (
              <img src={hotelLogo} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <Icon icon="mdi:office-building" width={22} className="text-blue-600" />
            )}
          </div>
          <span className="text-sm font-bold text-black">Hotel Name</span>
        </div>

        {/* MAIN MENU */}
        <nav className="flex-1 px-3 flex flex-col gap-4 overflow-y-auto no-scrollbar py-4">
          {mainMenu.map((item) =>
            item.label === "Quick Bill" ? (
              <motion.button
                key={item.label}
                whileTap={{ scale: 0.96 }}
                onClick={openQuickBill}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ease-in-out text-black font-bold hover:bg-gray-100 hover:translate-x-1"
              >
                <Icon icon={item.icon} width={22} className="shrink-0" />
                <span>{item.label}</span>
              </motion.button>
            ) : (
              <NavLink
                key={item.label}
                to={item.path}
                onClick={() => onClose && onClose()}
                className={({ isActive }) => `
                  flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm
                  transition-all duration-200 ease-in-out
                  ${isActive
                    ? "bg-blue-50 text-blue-600 font-bold shadow-sm"
                    : "text-black font-bold hover:bg-gray-100 hover:translate-x-1"
                  }
                `}
              >
                {({ isActive }) => (
                  <motion.div className="flex items-center gap-3 w-full" whileTap={{ scale: 0.96 }}>
                    <Icon icon={item.icon} width={22} className="shrink-0" />
                    <span>{item.label}</span>
                  </motion.div>
                )}
              </NavLink>
            )
          )}
        </nav>
      </motion.aside>

      {/* QUICK BILL MODAL / SHEET */}
      <AnimatePresence>
        {qbModalOpen && (
          <div
            className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-end md:items-center justify-center"
            onClick={() => setQbModalOpen(false)}
          >
            <motion.div
              initial={isMobile ? { y: "100%" } : { opacity: 0, scale: 0.95 }}
              animate={isMobile ? { y: 0 } : { opacity: 1, scale: 1 }}
              exit={isMobile ? { y: "100%" } : { opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className={`
                 bg-white w-full max-w-sm p-6 shadow-2xl border border-gray-100
                 ${isMobile ? "rounded-t-3xl pb-10" : "rounded-3xl mx-4"}
              `}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-900">Select Quick Bill</h3>
                <button onClick={() => setQbModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <Icon icon="mdi:close" width={20} className="text-gray-500" />
                </button>
              </div>

              <div className="grid gap-3">
                {[
                  { id: 'takeaway', label: 'Takeaway', sub: 'KOT & Food Orders', icon: 'mdi:shopping-outline', color: 'blue' },
                  { id: 'billing', label: 'Billing', sub: 'Table & Room Service', icon: 'mdi:cash-register', color: 'indigo' },
                  { id: 'tender', label: 'Tender', sub: 'Other Payments', icon: 'mdi:cash-multiple', color: 'amber' }
                ].map((opt) => (
                  <motion.button
                    key={opt.id}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => chooseQuickBill(opt.id)}
                    className={`flex items-center gap-4 px-5 py-4 border border-gray-100 rounded-2xl hover:bg-${opt.color}-50 hover:border-${opt.color}-100 hover:shadow-md transition-all duration-200 group text-left`}
                  >
                    <div className={`w-10 h-10 rounded-full bg-${opt.color}-100 flex items-center justify-center group-hover:bg-${opt.color}-200 transition-colors`}>
                      <Icon icon={opt.icon} width={20} className={`text-${opt.color}-600`} />
                    </div>
                    <div>
                      <span className="block font-bold text-gray-900">{opt.label}</span>
                      <span className="text-xs text-gray-500">{opt.sub}</span>
                    </div>
                  </motion.button>
                ))}
              </div>

              <div className="mt-6 text-center">
                <p className="text-xs text-gray-400">Select an option to proceed</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
