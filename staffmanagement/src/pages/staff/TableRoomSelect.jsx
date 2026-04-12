import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PageWrapper from "../../components/PageWrapper";
import { ChevronLeft } from "lucide-react";
import { Icon } from "@iconify/react";
import { useNavigate, useLocation } from "react-router-dom";
import { useOrders } from "../../context/OrderContext";
import api from "../../utils/api";
import socket from "../../utils/socket";
import toast from "react-hot-toast";

export default function TableRoomSelect() {
  const navigate = useNavigate();
  const location = useLocation();
  const [qrcodes, setQrcodes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Tabs: "Table" (indoor), "Rooms" (vip/others)
  const [activeTab, setActiveTab] = useState(location.state?.activeTab || "Table");
  const { orders } = useOrders();

  // Quick Bill Modes: null (default), 'billing', 'tender'
  const [mode, setMode] = useState(null);
  const [qbModalOpen, setQbModalOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);

  useEffect(() => {
    fetchData();

    // Socket Listeners for Real-time updates
    const onUpdate = () => fetchData();
    socket.on('table:scanned', onUpdate);
    socket.on('table:freed', onUpdate);
    socket.on('order:new', onUpdate);
    socket.on('order:update', onUpdate);

    return () => {
      socket.off('table:scanned', onUpdate);
      socket.off('table:freed', onUpdate);
      socket.off('order:new', onUpdate);
      socket.off('order:update', onUpdate);
    };
  }, [location.state?.activeTab]);

  const fetchData = async () => {
    try {
      const response = await api.get('/qrcodes');
      setQrcodes(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching QR codes:", error);
      setLoading(false);
    }
  };

  const handleClearTable = async () => {
    if (!selectedTable) return;
    try {
      await api.post('/qrcodes/reset', { tableId: selectedTable.tableId });
      toast.success(`Table ${selectedTable.tableId} marked as Free`);
      setSelectedTable(null);
      fetchData(); // Refresh immediately
    } catch (err) {
      console.error("Failed to reset table", err);
      toast.error(err.response?.data?.message || "Failed to clear status");
    }
  };

  // Tab Definitions
  const tabs = ["Table", "Rooms"];

  const getItems = () => {
    return qrcodes
      .filter(q => {
        const zone = (q.zone || "").toLowerCase();
        if (activeTab === "Table") return zone === "indoor" || zone === "table";
        if (activeTab === "Rooms") return zone === "vip" || zone.includes("room");
        return false;
      })
      .map(q => ({
        id: q._id,
        tableId: q.tableId,
        label: q.metadata?.tableName || q.tableId,
        image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=500",
      }));
  };

  const activeItems = getItems();

  const handleQuickBillAction = (actionId) => {
    setQbModalOpen(false);
    if (actionId === 'takeaway') {
      navigate('/staff/menu', { state: { type: 'takeaway', room: 'Take Away' } });
    } else if (actionId === 'billing') {
      setMode('billing');
      setActiveTab("Table");
      toast("Select a table to bill", { icon: '📝' });
    } else if (actionId === 'tender') {
      setMode('tender');
      setActiveTab("Table");
      toast("Select an occupied table", { icon: '💰' });
    }
  };

  const handleTableClick = (item, activeOrder) => {
    // Billing Mode: Go to Menu
    if (mode === 'billing') {
      navigate('/staff/menu', { state: { room: item.label, tableId: item.tableId, type: activeTab === 'Rooms' ? 'room' : 'table' } });
      setMode(null);
      return;
    }

    const hasActiveOrder = activeOrder && (activeOrder.status !== 'completed' && activeOrder.status !== 'delivered');
    // NOTE: We might want to be more liberal with 'activeOrder' check for Tender mode logic parity with Admin

    if (mode === 'tender') {
      if (!activeOrder && item.status !== 'occupied') {
        // We can rely on logic: if activeOrder exists OR backend says occupied
        // But let's trust activeOrder from context as primary source of truth for "Billing" status
        // If visually free (green), user shouldn't be tendering it?
        // Admin Logic: item.status === 'free' -> toast error.
        if (!activeOrder) { // Visual check relying on order context
          toast.error("This table is not occupied");
        } else {
          setSelectedTable({ ...item, hasOrder: true });
        }
      } else {
        setSelectedTable({ ...item, hasOrder: true });
      }
      return;
    }

    // Default Mode
    if (!activeOrder) {
      // Free -> Go to menu
      navigate('/staff/menu', { state: { room: item.label, tableId: item.tableId, type: activeTab === 'Rooms' ? 'room' : 'table' } });
    } else {
      // Occupied -> Open Action Modal
      setSelectedTable({ ...item, hasOrder: true });
    }
  };

  return (
    <PageWrapper className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white sticky top-0 z-10 px-4 py-3 flex items-center justify-between border-b border-gray-100 shadow-sm mb-4">
        <div className="flex items-center gap-3">
          <button onClick={() => mode ? setMode(null) : navigate(-1)} className="p-1 -ml-1">
            <ChevronLeft size={28} className="text-black" strokeWidth={1.5} />
          </button>
          <h1 className="text-lg font-bold text-black">
            {mode === 'billing' ? 'Billing' : mode === 'tender' ? 'Tender' : 'Table / Room'}
          </h1>
        </div>

        {/* Quick Bill Button */}
        {mode ? (
          <button
            onClick={() => setMode(null)}
            className="bg-red-50 text-red-500 border border-red-100 text-xs font-bold px-4 py-2 rounded-full active:scale-95 transition-all"
          >
            Cancel {mode}
          </button>
        ) : (
          <button
            onClick={() => setQbModalOpen(true)}
            className="bg-[#1C1C1E] text-white text-xs font-medium px-4 py-2 rounded-full"
          >
            Quick Bill
          </button>
        )}
      </div>

      <div className="px-4 pb-20">
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
          </div>
        ) : (
          <>
            {/* Filters */}
            <div className="flex gap-2 mb-6">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-2 rounded-full text-sm font-bold transition-colors ${activeTab === tab
                    ? "bg-[#1C1C1E] text-white shadow-md"
                    : "bg-white text-gray-500 border border-gray-200"
                    }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-6">
              {activeItems.map((item) => {
                const activeOrder = orders.find(o =>
                  o.tableNo === item.tableId &&
                  o.status !== 'delivered' &&
                  o.status !== 'completed'
                );

                let statusClass = "border-transparent";
                if (activeOrder) {
                  if (activeOrder.status === 'pending') statusClass = "border-red-500 border-2";
                  else statusClass = "border-green-500 border-2";
                }

                return (
                  <motion.div
                    key={item.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`flex flex-col items-center cursor-pointer active:opacity-80 transition-opacity ${mode === 'tender' && !activeOrder ? 'opacity-40 grayscale' : ''}`}
                    onClick={() => handleTableClick(item, activeOrder)}
                  >
                    {/* Image Card */}
                    <div className={`w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-md mb-2 bg-gray-200 relative ${statusClass}`}>
                      <img
                        src={item.image}
                        alt={item.label}
                        className="w-full h-full object-cover"
                      />
                      {activeOrder && (
                        <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-[10px] font-bold text-white ${activeOrder.status === 'pending' ? 'bg-red-500' : 'bg-green-500'}`}>
                          {activeOrder.status === 'pending' ? 'New' : 'Occupied'}
                        </div>
                      )}
                    </div>
                    {/* Label */}
                    <span className="text-sm font-semibold text-black">
                      {item.label}
                    </span>
                  </motion.div>
                );
              })}
            </div>

            {activeItems.length === 0 && (
              <div className="text-center py-20 text-gray-400">
                <p>No {activeTab.toLowerCase()}s found.</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* QUICK BILL SELECTION MODAL */}
      <AnimatePresence>
        {qbModalOpen && (
          <div
            className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-end md:items-center justify-center"
            onClick={() => setQbModalOpen(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white w-full max-w-sm p-6 rounded-t-3xl md:rounded-3xl shadow-2xl border-t border-gray-100"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-900">Select Quick Bill</h3>
                <button onClick={() => setQbModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <Icon icon="mdi:close" width={24} className="text-gray-500" />
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
                    onClick={() => handleQuickBillAction(opt.id)}
                    className={`flex items-center gap-4 px-5 py-4 border border-gray-100 rounded-2xl hover:bg-${opt.color}-50 hover:border-${opt.color}-100 transition-all duration-200 group text-left shadow-sm`}
                  >
                    <div className={`w-12 h-12 rounded-full bg-${opt.color}-100 flex items-center justify-center transition-colors`}>
                      <Icon icon={opt.icon} width={24} className={`text-${opt.color}-600`} />
                    </div>
                    <div>
                      <span className="block font-bold text-gray-900 text-base">{opt.label}</span>
                      <span className="text-xs text-gray-500">{opt.sub}</span>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* TABLE ACTION MODAL */}
      <AnimatePresence>
        {selectedTable && (
          <div
            className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm flex items-center justify-center px-4"
            onClick={() => setSelectedTable(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white w-full max-w-xs rounded-3xl p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold mb-2">{selectedTable.label}</h3>
              <p className="text-gray-500 text-sm mb-6">
                Status: <span className="font-bold text-black uppercase">Occupied</span>
              </p>

              <div className="space-y-3">
                {/* VIEW BILL / PROCEED */}
                <button
                  onClick={() => {
                    navigate('/staff/cart', { state: { tableId: selectedTable.tableId } });
                    setSelectedTable(null);
                  }}
                  className="w-full bg-black text-white font-bold py-3.5 rounded-xl hover:bg-gray-800 transition"
                >
                  {mode === 'tender' ? 'Proceed to Bill' : 'View Bill / Order'}
                </button>

                {/* MARK AS FREE */}
                <button
                  onClick={handleClearTable}
                  className="w-full bg-white border border-gray-200 text-red-600 font-bold py-3.5 rounded-xl hover:bg-red-50 hover:border-red-100 transition"
                >
                  Mark as Free
                </button>

                <button
                  onClick={() => setSelectedTable(null)}
                  className="w-full text-gray-400 text-sm font-semibold py-2 hover:text-gray-600"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>


    </PageWrapper>
  );
}
