import { useState, useEffect } from "react";
import PageWrapper from "../components/layout/PageWrapper";
import { Plus, Pencil } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../utils/api";
import socket from "../utils/socket";
import toast from "react-hot-toast";

export default function Tables() {
  const [activeTab, setActiveTab] = useState("table");
  const [tables, setTables] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // New State for Modal
  const [selectedTable, setSelectedTable] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();
  const mode = location.state?.mode; // 'billing' | 'tender' | undefined

  useEffect(() => {
    fetchData();
    // Poll for status updates (new orders)
    const interval = setInterval(fetchData, 10000);

    // Socket Listeners for Real-time updates
    const onUpdate = () => fetchData();
    socket.on('table:scanned', onUpdate);
    socket.on('table:freed', onUpdate);
    socket.on('order:new', onUpdate);
    socket.on('order:update', onUpdate);

    return () => {
      clearInterval(interval);
      socket.off('table:scanned', onUpdate);
      socket.off('table:freed', onUpdate);
      socket.off('order:new', onUpdate);
      socket.off('order:update', onUpdate);
    };
  }, []);

  // Check for Occupied Tables in Tender Mode
  useEffect(() => {
    if (!loading && mode === 'tender') {
      const allItems = [...tables, ...rooms];
      const hasOccupied = allItems.some(t => t.status !== 'free');
      if (!hasOccupied && allItems.length > 0) {
        toast.error("There is no any occupied tables", { id: 'no-occupied' });
      }
    }
  }, [loading, tables, rooms, mode]);


  const fetchData = async () => {
    try {
      const [qrRes, orderRes] = await Promise.all([
        api.get('/qrcodes'),
        api.get('/orders')
      ]);

      const allQrs = qrRes.data;
      const allOrders = orderRes.data;

      // Filter active orders
      const activeOrders = allOrders.filter(o => o.status !== 'completed' && o.status !== 'cancelled');
      // Let's assume 'completed' is when table is free.

      setOrders(activeOrders);

      // Split into tables and rooms
      const isTable = (q) => {
        const id = q.tableId?.toLowerCase() || '';
        const name = q.metadata?.tableName?.toLowerCase() || '';
        return id.startsWith('t-') || id.includes('table') || name.startsWith('table') || (q.zone !== 'vip' && !id.includes('room') && !name.includes('room'));
      };

      const tList = allQrs.filter(q => isTable(q));
      const rList = allQrs.filter(q => !isTable(q));

      // Map status
      const mapStatus = (list) => list.map(item => {
        const hasOrder = activeOrders.find(o => o.tableNo === item.tableId);
        let status = 'free';

        if (hasOrder) {
          status = hasOrder.status === 'ready' || hasOrder.status === 'delivered' ? 'tender' : 'occupied';
          // occupied = preparing/pending, tender = ready/delivered (eating?)
        } else {
          // Check if scanned recently (e.g. within 20 mins)
          if (item.lastScanned) {
            const diff = new Date() - new Date(item.lastScanned);
            if (diff < 20 * 60 * 1000) { // 20 mins
              status = 'occupied';
            }
          }
        }
        return { ...item, status };
      });

      setTables(mapStatus(tList));
      setRooms(mapStatus(rList));
      setLoading(false);

    } catch (err) {
      console.error("Failed to fetch table data", err);
      setLoading(false);
    }
  };

  const handleClearTable = async () => {
    if (!selectedTable) return;
    try {
      console.log("Resetting table:", selectedTable.tableId);
      await api.post('/qrcodes/reset', { tableId: selectedTable.tableId });
      toast.success(`Table ${selectedTable.tableId} marked as Free`);
      setSelectedTable(null);
      fetchData(); // Immediate refresh
    } catch (err) {
      console.error("Failed to reset table", err, err.response?.data, err.response?.status);
      toast.error(err.response?.data?.message || "Failed to clear status");
    }
  };

  const list = activeTab === "table" ? tables : rooms;

  return (
    <PageWrapper>
      <div className="animate-page space-y-6 relative">

        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">
              {mode === 'billing' ? 'Select Table for Billing' : mode === 'tender' ? 'Select Table to Tender' : 'Tables Source'}
            </h1>
            <p className="text-gray-500 text-sm">
              {mode ? 'Click on a table to proceed' : 'Real-time occupancy based on active orders.'}
            </p>
          </div>
        </div>




        {/* Tabs */}
        <div className="flex gap-3 mb-8">
          {["table", "room"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-8 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${activeTab === tab
                ? "bg-black text-white shadow-lg transform scale-105"
                : "bg-white text-gray-500 border border-gray-100 hover:text-black hover:bg-gray-50 sidebar-tab"
                }`}
            >
              {tab === "table" ? "Tables" : "Rooms"}
            </button>
          ))}
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {list.map((item) => (
            <div
              key={item._id}
              onClick={() => {
                // BILLING MODE: Always allow select -> Open Menu
                if (mode === 'billing') {
                  navigate('/menu', { state: { tableId: item.tableId } });
                  return;
                }

                // TENDER MODE: Only occupied tables
                if (mode === 'tender') {
                  if (item.status === 'free') {
                    toast.error("This table is not occupied");
                  } else {
                    // Open Modal for Tendering Options (Bill or Free)
                    setSelectedTable(item);
                  }
                  return;
                }

                // DEFAULT MODE
                // If Free -> Go directly to menu (for creating order)
                // If Occupied/Tender -> Open Modal
                if (item.status === 'free') {
                  navigate('/menu', { state: { tableId: item.tableId } });
                } else {
                  setSelectedTable(item);
                }
              }}
              className={`
                bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300 group
                cursor-pointer hover:shadow-xl hover:-translate-y-1
                ${mode === 'tender' && item.status === 'free' ? 'opacity-50 grayscale' : ''}
              `}
            >
              <div className="h-32 w-full bg-gray-100 flex items-center justify-center">
                <span className={`text-4xl font-bold ${item.status === 'free' ? 'text-gray-300' : 'text-gray-600'}`}>
                  {item.tableId}
                </span>
              </div>

              <div className="p-4 flex justify-between items-center">
                <p className="font-medium">{item.metadata?.tableName || item.tableId}</p>

                <div className="flex items-center gap-3">
                  {/* Status Indicator */}
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-3 h-3 rounded-full ${item.status === "free"
                        ? "bg-green-500 ring-4 ring-green-100"
                        : item.status === "tender"
                          ? "bg-yellow-500 ring-4 ring-yellow-100"
                          : "bg-red-500 ring-4 ring-red-100"
                        }`}
                    />
                    <span className="text-xs uppercase font-bold text-gray-400">{item.status}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {list.length === 0 && !loading && (
            <div className="col-span-full py-10 text-center text-gray-400">
              No {activeTab}s found. Check QR Code Management.
            </div>
          )}
        </div>

        {/* Add Button Hint */}
        {!mode && (
          <div className="flex justify-end mt-8">
            <button
              onClick={() => navigate('/qr')}
              className="bg-black text-white px-8 py-3 rounded-full text-sm font-bold shadow-lg hover:bg-gray-800 transition-all flex items-center gap-2"
            >
              <Plus size={18} />
              Manage Tables (QR Codes)
            </button>
          </div>
        )}

        {/* --- MODAL (For Default & Tender Modes) --- */}
        {selectedTable && (!mode || mode === 'tender') && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl scale-100 transform transition-all">
              <h3 className="text-xl font-bold mb-2">
                {selectedTable.metadata?.tableName || selectedTable.tableId}
              </h3>
              <p className="text-gray-500 text-sm mb-6">
                Status: <span className="font-bold uppercase text-black">{selectedTable.status}</span>
              </p>

              <div className="space-y-3">
                <button
                  onClick={() => {
                    const hasOrder = orders.find(o => o.tableNo === selectedTable.tableId);
                    if (mode === 'tender') {
                      // In Tender mode, "View Bill" goes to Receipt
                      navigate('/receipt', {
                        state: {
                          tableId: selectedTable.tableId,
                          order: hasOrder
                        }
                      });
                    } else {
                      // Default mode, "View Bill" goes to Menu
                      navigate('/menu', {
                        state: {
                          tableId: selectedTable.tableId,
                          order: hasOrder
                        }
                      });
                    }
                  }}
                  className="w-full bg-black text-white font-bold py-3.5 rounded-xl hover:bg-gray-800 transition"
                >
                  {mode === 'tender' ? 'Proceed to Bill / Receipt' : 'View Bill / Order'}
                </button>

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
            </div>
          </div>
        )}

      </div>
    </PageWrapper >
  );
}
