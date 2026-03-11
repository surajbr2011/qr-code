import { useState, useEffect } from "react";
import { FiArrowLeft, FiCheckCircle } from "react-icons/fi";
import PageWrapper from "../components/PageWrapper";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import BottomNav from "../components/BottomNav";
import api from "../utils/api";
import { toast } from "react-hot-toast";

export default function Bill() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme, isAvengerMode } = useTheme();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUnpaidOrders();
  }, []);

  const fetchUnpaidOrders = async () => {
    try {
      const { data } = await api.get('/orders/my-orders');
      // Filter for active, unpaid orders
      const unpaid = data.filter(o =>
        !['paid', 'cancelled'].includes(o.paymentStatus) &&
        !['cancelled', 'completed'].includes(o.status)
      );
      setOrders(unpaid);
    } catch (err) {
      console.error("Failed to fetch bill:", err);
      toast.error("Could not load bill details");
    } finally {
      setLoading(false);
    }
  };

  // Calculate Totals
  const totalAmount = orders.reduce((sum, order) => sum + order.totalAmount, 0);
  const totalItems = orders.reduce((sum, order) => sum + order.items.length, 0);

  const handlePayBill = () => {
    if (orders.length === 0) return;

    // We need to pass the list of Order IDs to the Payment page
    // But Payment page currently takes a single orderID. 
    // Wait, the better approach is to create a "Super Order" or just let Payment page handle multiple?
    // My previous plan said: "Call verifyPayment with all orderIds".
    // But the Payment UI needs to know the total amount.
    // The current Payment.jsx fetches a single order by ID.
    // I should probably modify Payment.jsx or just handle payment logic here directly?
    // DIRECTLY HANDLING PAYMENT HERE seems cleaner for this specific "Pay Bill" flow.
    // However, re-using Payment.jsx is better for consistency (Razorpay logic etc).

    // Let's modify Payment.jsx to accept an array of IDs or a specific "bill" mode.
    // OR create a temporary "Consolidated Order" object to pass state? No.

    // Simplest approach: Pass valid data in state that Payment.jsx understands. 
    // Payment.jsx expects `orderId`. It fetches `/orders/:id`.
    // It won't work for multiple orders unless I change Payment.jsx.

    // ALTERNATIVE: Create a "Bill Payment" component logic here. 
    // Let's execute the Razorpay logic directly here for simplicity and to avoid breaking the single-order payment flow if it's used elsewhere.

    navigate("/payment-consolidated", { state: { orders } });
  };

  return (
    <PageWrapper className={`min-h-screen max-w-[430px] mx-auto pb-24 transition-colors duration-500 ${theme.bg}`}>
      {/* HEADER */}
      <div className={`h-14 flex items-center justify-center relative border-b transition-colors duration-500 ${theme.headerBg} ${theme.border}`}>
        <button
          onClick={() => navigate(-1)}
          className={`absolute left-4 p-2 rounded-full transition ${isAvengerMode ? 'text-slate-300 hover:bg-slate-800' : 'text-gray-700 hover:bg-gray-100'}`}
        >
          <FiArrowLeft size={20} />
        </button>
        <h1 className={`text-base font-semibold ${theme.text}`}>My Bill</h1>
      </div>

      <div className="px-4 mt-6 space-y-4">
        {loading ? (
          <div className={`text-center py-10 ${theme.textSec}`}>Loading bill...</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-10 space-y-2">
            <FiCheckCircle size={40} className="mx-auto text-green-500 mb-2" />
            <p className={`text-base font-medium ${theme.text}`}>All caught up!</p>
            <p className={`text-xs ${theme.textSec}`}>No pending bills to pay.</p>
            <button
              onClick={() => navigate('/menu')}
              className={`mt-4 text-sm font-bold ${isAvengerMode ? 'text-red-500' : 'text-orange-500'}`}
            >
              Order More Items
            </button>
          </div>
        ) : (
          <>
            {/* ORDERS LIST */}
            <div className="space-y-4">
              {orders.map(order => (
                <div key={order._id} className={`p-4 rounded-xl border shadow-sm ${theme.cardBg} ${theme.border}`}>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className={`text-xs font-bold uppercase ${isAvengerMode ? 'text-red-400' : 'text-orange-500'}`}>
                        Order #{order._id.slice(-4)}
                      </p>
                      <p className={`text-[10px] ${theme.textSec}`}>
                        {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <span className={`font-bold ${theme.text}`}>₹{order.totalAmount}</span>
                  </div>
                  <div className="space-y-1">
                    {order.items.map((item, idx) => (
                      <div key={idx} className={`flex justify-between text-xs ${theme.textSec}`}>
                        <span>{item.qty} x {item.name}</span>
                        <span>{item.price * item.qty}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* TOTAL SUMMARY */}
            <div className={`mt-6 p-4 rounded-xl border-t-2 border-dashed ${theme.border} ${isAvengerMode ? 'bg-slate-800/50' : 'bg-gray-50'}`}>
              <div className="flex justify-between items-center mb-1">
                <span className={`text-sm ${theme.textSec}`}>Total Items</span>
                <span className={`font-medium ${theme.text}`}>{totalItems}</span>
              </div>
              <div className="flex justify-between items-center text-lg font-bold">
                <span className={theme.text}>Total Payable</span>
                <span className={isAvengerMode ? 'text-red-500' : 'text-orange-600'}>₹{totalAmount.toFixed(2)}</span>
              </div>
            </div>

            {/* PAY BUTTON */}
            <button
              onClick={() => navigate('/payment', { state: { consolidatedOrders: orders, totalAmount } })}
              className={`w-full py-4 rounded-2xl font-bold text-lg text-white shadow-lg active:scale-[0.98] transition
                    ${isAvengerMode
                  ? 'bg-gradient-to-r from-red-700 to-red-900 shadow-red-900/40'
                  : 'bg-gradient-to-r from-orange-500 to-red-500 shadow-orange-500/40'}`}
            >
              Pay Bill (₹{totalAmount.toFixed(0)})
            </button>
          </>
        )}
      </div>

      <BottomNav />
    </PageWrapper>
  );
}
