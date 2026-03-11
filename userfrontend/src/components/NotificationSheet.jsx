import { useState, useEffect } from "react";
import { FiX } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import api from "../utils/api";

export default function NotificationSheet({ open, onClose }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      fetchNotifications();
    }
  }, [open]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      // Fetch active offers as notifications
      const { data } = await api.get("/offers");
      setNotifications(data || []);
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[60] flex justify-center items-end sm:items-center">
          {/* backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />

          {/* sheet */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-[430px] bg-white rounded-t-2xl sm:rounded-2xl
                       p-4 shadow-2xl mx-auto overflow-hidden"
          >
            <div className="flex justify-between items-center mb-4 border-b pb-2">
              <h3 className="font-bold text-lg">Notifications</h3>
              <button onClick={onClose} className="p-1 bg-gray-100 rounded-full hover:bg-gray-200 transition">
                <FiX size={20} />
              </button>
            </div>

            <div className="space-y-3 max-h-[60vh] overflow-y-auto">
              {loading ? (
                <p className="text-center text-gray-400 py-4">Loading...</p>
              ) : notifications.length > 0 ? (
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="show"
                  className="space-y-3"
                >
                  {notifications.map((offer) => (
                    <motion.div
                      key={offer._id}
                      variants={itemVariants}
                      whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)" }}
                      className="bg-orange-50 p-4 rounded-xl border border-orange-100 flex gap-3 shadow-sm cursor-pointer transition-shadow"
                    >
                      <div className="text-2xl">🎉</div>
                      <div>
                        <h4 className="font-bold text-orange-800 text-sm">{offer.title}</h4>
                        <p className="text-xs text-orange-600 mt-1">{offer.description}</p>
                        {offer.discount && <div className="mt-2 text-xs font-bold bg-white text-orange-600 px-2 py-1 rounded w-fit border border-orange-200">
                          {offer.discount}% OFF
                        </div>}
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <p>No new notifications</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
