import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PageWrapper from "../../components/PageWrapper";
import OrderCard from "../../components/orders/OrderCard";
import PendingOrderCard from "../../components/orders/PendingOrderCard";
import OrderTypeToggle from "../../components/orders/OrderTypeToggle";
import OrderStatusTabs from "../../components/orders/OrderStatusTabs";
import OrderActionModal from "../../components/orders/OrderActionModal";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Search, Plus } from "lucide-react";
import toast from "react-hot-toast";
import { useOrders } from "../../context/OrderContext";

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

export default function OrderManagement() {
  const navigate = useNavigate();
  // Active tab for the bottom section (History/Processing)
  const [activeStatus, setActiveStatus] = useState("confirm");

  // Auto-scroll to top when tab changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setSearch(""); // Clear search to ensure new orders are visible
  }, [activeStatus]);

  // Order type toggle
  const [orderType, setOrderType] = useState("table");

  // Global Data
  /* ================= DATA CONSUMPTION ================= */
  const { orders: rawOrders, updateOrderStatus, loading } = useOrders();

  // Sort orders by date (newest first)
  const orders = [...rawOrders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  // Modal State
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Search state
  const [search, setSearch] = useState("");

  // 1. Separate Pending Orders
  const pendingOrders = orders.filter(o =>
    o.status === 'pending' &&
    o.type === orderType &&
    (o.room && o.room.toLowerCase().includes(search.toLowerCase()) || (o.id && o.id.toString().includes(search)))
  );

  // 2. Filter orders for the active tab with robust matching
  const visibleOrders = orders.filter((o) => {
    if (!o || !o.status) return false;

    // Normalize values
    const orderStatus = o.status.toLowerCase().trim();
    const tabId = activeStatus.toLowerCase().trim();

    // Define which backend statuses belong to which UI tab
    const statusMap = {
      confirm: ['confirm', 'confirmed'],
      preparing: ['preparing', 'ready', 'processing', 'prepared'],
      delivered: ['delivered', 'ontheway', 'served', 'completed']
    };

    const allowedStatuses = statusMap[tabId] || [tabId];
    const isStatusMatch = allowedStatuses.includes(orderStatus);
    const isTypeMatch = o.type === orderType;

    // Search match (if search exists)
    const searchMatch = !search ||
      (o.room && o.room.toLowerCase().includes(search.toLowerCase())) ||
      (o.id && o.id.toString().includes(search));

    return isStatusMatch && orderStatus !== 'pending' && isTypeMatch && searchMatch;
  });

  const handleOrderClick = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleUpdateStatus = (orderId, newStatus) => {
    // newStatus might be 'served' -> backend 'delivered'
    let backendStatus = newStatus;
    if (newStatus === 'served') backendStatus = 'delivered';
    if (newStatus === 'foodready') backendStatus = 'ready';

    updateOrderStatus(orderId, backendStatus);

    // Auto-switch tabs based on status change
    if (backendStatus === 'preparing') {
      setActiveStatus('preparing');
    } else if (backendStatus === 'delivered') {
      setActiveStatus('delivered');
    }

    toast.success(`Order updated`);
  };

  const handleConfirmOrder = (order) => {
    updateOrderStatus(order.id, 'confirm'); // Changed from 'preparing' to 'confirm'
    setActiveStatus('confirm');
    toast.success(`Order #${order.id.slice(-4)} confirmed`);
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-400 font-medium">Loading orders...</div>;
  }

  return (
    <>
      <PageWrapper className="min-h-screen bg-gray-50 flex flex-col">
        <div className="bg-white sticky top-0 z-20 border-b border-gray-100 shadow-sm">
          {/* Header */}
          <div className="px-4 py-3">
            <div className="flex items-center gap-3 mb-3">
              <button onClick={() => navigate(-1)} className="p-1 -ml-1">
                <ChevronLeft size={28} className="text-black" strokeWidth={1.5} />
              </button>
              <h1 className="text-lg font-bold text-black flex-1">Order Management</h1>
              <button
                onClick={() => navigate('/staff/table-room')}
                className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-white active:scale-95 transition-transform"
              >
                <Plus size={18} />
              </button>
            </div>

            {/* Search Bar */}
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search Table or Order ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-gray-100 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-black/5 transition-all"
              />
            </div>

            {/* Toggle & Filters Group (Now Sticky) */}
            <div className="space-y-4 pb-3">
              <OrderTypeToggle value={orderType} onChange={setOrderType} />

              <OrderStatusTabs
                value={activeStatus}
                onChange={setActiveStatus}
              />
            </div>
          </div>
        </div>

        <div className="px-4 pb-4 px-1 flex justify-between items-center">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            {orderType} List ({visibleOrders.length})
          </span>
          {loading && <span className="text-[10px] text-blue-500 animate-pulse">Syncing...</span>}
        </div>

        <div className="px-4 pb-40 pt-2 space-y-6">
          {/* SECTION 1: Pending Orders Container */}
          {pendingOrders.length > 0 && (
            <div className="bg-white rounded-[24px] shadow-sm p-5 border border-gray-100">
              <h3 className="text-[11px] font-bold text-red-500 uppercase tracking-wider mb-4 px-1">New Requests ({pendingOrders.length})</h3>
              <div className="space-y-4">
                {pendingOrders.map((order) => (
                  <PendingOrderCard
                    key={order.id}
                    order={order}
                    onConfirm={handleConfirmOrder}
                  />
                ))}
              </div>
            </div>
          )}

          {/* SECTION 2: Filtered Order List */}
          <div className="space-y-4">
            {visibleOrders.map((order) => (
              <div key={order.id}>
                <OrderCard
                  order={order}
                  onClick={() => handleOrderClick(order)}
                />
              </div>
            ))}

            {visibleOrders.length === 0 && !loading && (
              <div className="text-center py-20 bg-white/50 rounded-[32px] border-2 border-dashed border-gray-100">
                <p className="text-sm font-bold text-gray-400">No {activeStatus} orders found</p>
                <p className="text-[10px] text-gray-300 mt-1">Total orders in system: {orders.length}</p>
              </div>
            )}
          </div>
        </div>
      </PageWrapper>

      {/* Action Modal (Outside PageWrapper to ignore transforms) */}
      <OrderActionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        order={selectedOrder}
        onUpdateStatus={handleUpdateStatus}
      />
    </>
  );
}
