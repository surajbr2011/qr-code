import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import PageWrapper from "../components/PageWrapper";
import { useState, useEffect } from "react";
import api from "../utils/api";
import { FiArrowLeft } from "react-icons/fi";
import { toast } from "react-hot-toast";
import { useTheme } from "../context/ThemeContext";

export default function OrderHistory() {
  const navigate = useNavigate();
  const { theme, isAvengerMode } = useTheme();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data } = await api.get('/orders/my-orders');
      setOrders(data);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
      // toast.error("Could not load order history");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper className={`min-h-screen flex justify-center transition-colors duration-500 ${theme.bg}`}>
      <div className="w-full max-w-[430px] px-4 py-6">

        {/* HEADER */}
        <header className={`sticky top-0 z-20 pb-4 transition-colors duration-500 ${theme.bg}`}>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className={`active:scale-95 transition p-2 rounded-full ${isAvengerMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              <FiArrowLeft size={20} />
            </button>
            <h1 className={`text-lg font-semibold ${theme.text}`}>My Orders</h1>
          </div>
        </header>

        {loading ? (
          <div className={`text-center mt-10 ${theme.textSec}`}>Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className={`text-center mt-10 ${theme.textSec}`}>No past orders found.</div>
        ) : (
          /* ORDER LIST */
          <motion.div
            className="space-y-4"
            initial="hidden"
            animate="show"
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.1
                }
              }
            }}
          >
            {orders.map((order) => (
              <motion.div
                key={order._id}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  show: { opacity: 1, y: 0 }
                }}
                whileHover={{ y: -5, boxShadow: isAvengerMode ? "0 10px 20px -5px rgba(220, 38, 38, 0.2)" : "0 10px 20px -5px rgba(0, 0, 0, 0.1)" }}
                whileTap={{ scale: 0.98 }}
                onClick={() =>
                  navigate("/order-tracking", {
                    state: { orderId: order._id },
                  })
                }
                className={`rounded-xl p-4 shadow-sm cursor-pointer active:scale-[0.98] transition border
                  ${isAvengerMode
                    ? 'bg-slate-800 border-slate-700'
                    : 'bg-white border-transparent'}`}
              >
                <div className="flex justify-between items-center">
                  <p className={`font-medium text-sm ${theme.text}`}>
                    #{order._id.slice(-6).toUpperCase()}
                  </p>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${order.status === "Served"
                      ? (isAvengerMode ? "bg-green-900/30 text-green-400" : "bg-green-100 text-green-600")
                      : (isAvengerMode ? "bg-orange-900/30 text-orange-400" : "bg-orange-100 text-orange-600")
                      }`}
                  >
                    {order.status}
                  </span>
                </div>

                <p className={`text-xs mt-1 ${theme.textSec}`}>
                  {new Date(order.createdAt).toLocaleDateString()} · {order.items?.length || 0} items
                </p>

                <p className={`mt-2 font-semibold ${theme.text}`}>
                  ₹{order.totalAmount}
                </p>
              </motion.div>
            ))}
          </motion.div>
        )}

      </div>
    </PageWrapper >
  );
}
