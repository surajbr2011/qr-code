import { useState, useEffect } from "react";
import { FiArrowLeft, FiUser, FiPhone, FiMapPin, FiEdit2, FiSave, FiX } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import PageWrapper from "../components/PageWrapper";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import InputField from "../auth/components/InputField";
import toast from "react-hot-toast";
import api from "../utils/api";
import { motion, AnimatePresence } from "framer-motion";

export default function ProfileView() {
  const navigate = useNavigate();
  const { user, setUserProfile } = useAuth();
  const { theme, isAvengerMode } = useTheme();

  // State
  const [isEditing, setIsEditing] = useState(false);
  const [isTableFixed, setIsTableFixed] = useState(false);
  const activeUser = user || {};
  const [formData, setFormData] = useState(activeUser);

  // Sync state
  useEffect(() => {
    if (user) {
      setFormData({
        ...user,
        contact: user.phone || ""
      });
    }
    const scannedTable = localStorage.getItem("qr_table_id");
    const scannedRoom = localStorage.getItem("qr_room_id");
    if (scannedTable || scannedRoom) setIsTableFixed(true);
  }, [user, isEditing]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!formData.name || !formData.contact) {
      toast.error("Name and Contact are required");
      return;
    }
    try {
      const { data } = await api.put('/auth/profile', {
        name: formData.name,
        email: formData.email,
        phone: formData.contact,
        tableRoom: formData.tableRoom,
        location: formData.location
      });
      setUserProfile(data);
      toast.success("Profile Updated!");
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Update failed");
    }
  };

  return (
    <PageWrapper className={`min-h-screen max-w-[430px] mx-auto pb-24 font-sans transition-colors duration-500 ${theme.bg}`}>

      {/* HEADER */}
      <header className={`sticky top-0 z-20 backdrop-blur-md border-b transition-colors duration-500 ${theme.headerBg} ${theme.border}`}>
        <div className="relative h-16 flex items-center justify-center px-4">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => isEditing ? setIsEditing(false) : navigate("/profile")}
            className={`absolute left-4 p-2 rounded-full transition ${isAvengerMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            <FiArrowLeft size={20} />
          </motion.button>
          <motion.h1
            key={isEditing ? "edit" : "view"}
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className={`text-lg font-bold ${theme.text}`}
          >
            {isEditing ? "Edit Profile" : "Profile Details"}
          </motion.h1>
        </div>
      </header>

      {/* CONTENT */}
      <div className="px-5 pt-8">

        {/* Avatar Section */}
        <div className="flex justify-center mb-8 relative">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`w-28 h-28 rounded-full flex items-center justify-center text-4xl font-bold text-white shadow-xl ring-4 
              ${isAvengerMode
                ? 'bg-gradient-to-br from-red-600 to-slate-800 shadow-red-900/40 ring-slate-800'
                : 'bg-gradient-to-tr from-orange-400 to-red-500 shadow-orange-500/20 ring-white'}`}
          >
            {formData.name?.charAt(0)?.toUpperCase() || <FiUser />}
          </motion.div>
          {/* Edit Badge */}
          {!isEditing && (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsEditing(true)}
              className={`absolute bottom-1 right-[33%] p-2 rounded-full shadow-md border 
                ${isAvengerMode ? 'bg-slate-800 border-slate-700 text-red-500' : 'bg-white border-gray-100 text-orange-500'}`}
            >
              <FiEdit2 size={16} />
            </motion.button>
          )}
        </div>

        <AnimatePresence mode="wait">
          {isEditing ? (
            /* ===== EDIT MODE ===== */
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`space-y-5 p-6 rounded-3xl shadow-sm border ${theme.cardBg} ${theme.border}`}
            >
              <InputGroup icon={FiUser} label="Full Name" theme={theme}>
                <InputField
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Enter Name"
                  className={`pl-10 ${isAvengerMode ? 'bg-slate-900 border-slate-700 text-white placeholder-slate-500' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                />
              </InputGroup>

              <InputGroup icon={FiPhone} label="Phone Number" theme={theme}>
                <InputField
                  value={formData.contact}
                  onChange={(e) => handleInputChange("contact", e.target.value)}
                  placeholder="Enter Phone Number"
                  type="tel"
                  className={`pl-10 ${isAvengerMode ? 'bg-slate-900 border-slate-700 text-white placeholder-slate-500' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                />
              </InputGroup>

              <InputGroup icon={FiMapPin} label="Table / Room" theme={theme}>
                <InputField
                  value={formData.tableRoom}
                  onChange={(e) => !isTableFixed && handleInputChange("tableRoom", e.target.value)}
                  placeholder="Table No"
                  readOnly={isTableFixed}
                  className={`pl-10 ${isTableFixed
                    ? (isAvengerMode ? "bg-slate-900/50 text-slate-500 cursor-not-allowed border-slate-800" : "bg-gray-50 text-gray-400 cursor-not-allowed")
                    : (isAvengerMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-gray-50 border-gray-200')
                    }`}
                />
              </InputGroup>

              <div className="pt-4 flex gap-3">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsEditing(false)}
                  className={`flex-1 py-3.5 rounded-xl font-bold transition flex items-center justify-center gap-2 
                    ${isAvengerMode ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  <FiX size={18} /> Cancel
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSave}
                  className={`flex-1 py-3.5 rounded-xl font-bold text-white flex items-center justify-center gap-2 shadow-lg 
                    ${isAvengerMode ? 'bg-gradient-to-r from-red-600 to-red-800 shadow-red-900/40' : 'bg-gradient-to-r from-orange-500 to-red-500 shadow-orange-500/30'}`}
                >
                  <FiSave size={18} /> Save
                </motion.button>
              </div>
            </motion.div>
          ) : (
            /* ===== VIEW MODE ===== */
            <motion.div
              key="view"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`rounded-3xl shadow-sm border overflow-hidden ${theme.cardBg} ${theme.border}`}
            >
              <div className={`divide-y ${isAvengerMode ? 'divide-slate-700' : 'divide-gray-50'}`}>
                <InfoRow icon={FiUser} label="Name" value={activeUser.name} delay={0.1} theme={theme} isAvengerMode={isAvengerMode} />
                <InfoRow icon={FiPhone} label="Phone" value={activeUser.phone} delay={0.3} theme={theme} isAvengerMode={isAvengerMode} />
                <InfoRow
                  icon={FiMapPin}
                  label="Table / Room"
                  value={localStorage.getItem("qr_location_name") || localStorage.getItem("qr_table_id") || localStorage.getItem("qr_room_id") || activeUser.tableRoom}
                  delay={0.4}
                  theme={theme}
                  isAvengerMode={isAvengerMode}
                />
              </div>

              <div className={`p-5 ${isAvengerMode ? 'bg-slate-900/30' : 'bg-gray-50/50'}`}>
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsEditing(true)}
                  className={`w-full py-3.5 rounded-xl font-bold shadow-sm border transition flex items-center justify-center gap-2
                    ${isAvengerMode
                      ? 'bg-slate-800 border-slate-700 text-red-500 hover:bg-slate-700'
                      : 'bg-white border-orange-200 text-orange-600 hover:bg-orange-50 hover:border-orange-300'}`}
                >
                  <FiEdit2 size={16} /> Edit Profile Details
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </PageWrapper >
  );
}

function InfoRow({ icon: Icon, label, value, delay, theme, isAvengerMode }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      className={`flex items-center p-4 transition-colors group ${isAvengerMode ? 'hover:bg-slate-700/50' : 'hover:bg-gray-50'}`}
    >
      <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 group-hover:scale-110 transition-transform
        ${isAvengerMode ? 'bg-slate-900 text-red-500' : 'bg-orange-50 text-orange-500'}`}>
        <Icon size={18} />
      </div>
      <div className="flex-1">
        <p className={`text-xs font-bold uppercase tracking-wider mb-0.5 ${theme.textSec}`}>{label}</p>
        <p className={`font-medium text-base truncate ${theme.text}`}>{value || <span className="text-gray-400 italic">Not provided</span>}</p>
      </div>
    </motion.div>
  );
}

function InputGroup({ icon: Icon, label, children, theme }) {
  return (
    <div className="relative">
      <label className={`text-xs font-bold mb-1.5 block ml-1 uppercase tracking-wide ${theme.textSec}`}>{label}</label>
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10">
          <Icon size={18} />
        </div>
        <div className="[&_input]:pl-10">
          {children}
        </div>
      </div>
    </div>
  )
}
