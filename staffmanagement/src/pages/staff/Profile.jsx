import { useNavigate } from "react-router-dom";
import PageWrapper from "../../components/PageWrapper";
import {
  FiChevronLeft,
  FiLogOut,
  FiCalendar,
  FiUser,
  FiFileText,
  FiTruck,
  FiHelpCircle,
  FiChevronRight
} from "react-icons/fi";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";

export default function Profile() {
  const navigate = useNavigate();

  const menuItems = [
    { label: "Profile View", path: "/staff/profile-view", icon: FiUser, color: "text-blue-500", bg: "bg-blue-50" },
    { label: "Bill", path: "/staff/quick-bill", icon: FiFileText, color: "text-green-500", bg: "bg-green-50" },
    { label: "Order Tracking", path: "/staff/orders", icon: FiTruck, color: "text-orange-500", bg: "bg-orange-50" },
    { label: "Support", path: "/staff/support", icon: FiHelpCircle, color: "text-purple-500", bg: "bg-purple-50" },
    { label: "Upcoming Events", path: "/staff/events", icon: FiCalendar, color: "text-red-500", bg: "bg-red-50" },
  ];

  const handleLogout = () => {
    localStorage.removeItem('staff_token');
    localStorage.removeItem('staff_user');
    toast.success("Logged out successfully");
    navigate('/staff/login');
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

  // Get current Staff Name/Role (Mock or LocalStorage)
  const staffUser = JSON.parse(localStorage.getItem("staff_user") || '{}');
  const staffName = staffUser.name || "Staff Member";
  const staffRole = staffUser.role || "Service Staff";

  return (
    <PageWrapper className="bg-gray-50 min-h-screen max-w-[430px] mx-auto pb-24 font-sans">

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md px-4 py-3 flex items-center sticky top-0 z-20 border-b border-gray-100 shadow-sm">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate(-1)}
          className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition"
        >
          <FiChevronLeft size={20} className="text-gray-700" />
        </motion.button>
        <h1 className="text-lg font-bold text-gray-800 flex-1 text-center pr-10">My Profile</h1>
      </header>



      {/* Menu List */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="px-4 mt-6 space-y-3"
      >
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <motion.button
              key={index}
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(item.path)}
              className="w-full flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:border-gray-200 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className={`p-2.5 rounded-full ${item.bg} ${item.color} group-hover:scale-110 transition-transform`}>
                  <Icon size={20} />
                </div>
                <span className="font-semibold text-gray-800 text-sm">{item.label}</span>
              </div>
              <FiChevronRight className="text-gray-300 group-hover:text-gray-400" />
            </motion.button>
          )
        })}

        <motion.div variants={itemVariants} className="pt-6">
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 p-4 bg-red-50 text-red-500 rounded-2xl font-bold hover:bg-red-100 transition shadow-sm border border-red-100"
          >
            <FiLogOut size={20} />
            <span>Logout</span>
          </motion.button>
        </motion.div>

      </motion.div>
    </PageWrapper>
  );
}
