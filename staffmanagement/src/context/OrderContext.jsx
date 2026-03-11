import { createContext, useContext, useState, useEffect } from "react";
import { io } from "socket.io-client";
import api from "../utils/api";
import toast from "react-hot-toast";

const OrderContext = createContext();

export function useOrders() {
  return useContext(OrderContext);
}

export function OrderProvider({ children }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);

  // Notification Helpers
  const addNotification = (notif) => {
    setNotifications(prev => [{
      id: Date.now() + Math.random(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: false,
      ...notif
    }, ...prev]);
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  // Fetch orders from API
  const fetchOrders = async () => {
    try {
      const { data } = await api.get("/orders");
      // ... (rest of fetch logic is fine, but shorter for replacement context) 
      // Actually, I should probably not replace the whole fetchOrders to avoid diff issues if I can help it.
      // But the Instruction says "Add...". I'll try to just insert the state and update socket effects.

      // Transform data to match UI expectations
      const mappedOrders = data.map(o => {
        let orderType = 'table';
        const tn = (o.tableNo || "").toLowerCase();
        if (tn.includes('room') || tn.startsWith('r-') || tn.startsWith('r ')) {
          orderType = 'room';
        }

        return {
          id: o._id,
          type: (o.type === 'self-service' || tn.includes('take') || tn.includes('self')) ? 'self-service' : orderType,
          room: o.tableNo || "Unknown",
          tableNo: o.tableNo || "Unknown",
          items: (o.items || []).map(i => ({
            id: i?.menuItem || i?._id,
            name: i?.name || "Unknown Item",
            quantity: i?.qty || i?.quantity || 1,
            variant: i?.variant
          })),
          staff: o.staff || "Unassigned",
          time: new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: o.status || 'pending',
          totalAmount: o.totalAmount || 0,
          instruction: o.specialInstructions
        };
      });

      const sortedOrders = mappedOrders
        .filter(o => o.status !== 'cancelled' && o.status !== 'completed')
        .sort((a, b) => {
          const rawB = data.find(raw => raw._id === b.id);
          const rawA = data.find(raw => raw._id === a.id);
          if (!rawA || !rawB) return 0;
          return new Date(rawB.createdAt) - new Date(rawA.createdAt);
        });

      setOrders(sortedOrders);
    } catch (err) {
      console.error("Failed to fetch orders", err);
    } finally {
      setLoading(false);
    }
  };

  // Sound and Socket
  useEffect(() => {
    const token = localStorage.getItem("staff_token");
    const socket = io("http://localhost:5001", {
      auth: { token },
      withCredentials: true
    });

    socket.on("order:new", (newOrder) => {
      fetchOrders();
      // Sound
      const audio = new Audio("/sounds/notification.mp3");
      audio.volume = 1.0;
      audio.play().catch(e => {
        console.log("Sound play error:", e);
        if (e.name === 'NotAllowedError') {
          toast("Click anywhere to enable sounds", { icon: "🔇" });
        }
      });
      toast.success(`New Request: ${newOrder.tableNo || "?"}`, { duration: 4000 });

      // Add Notification
      addNotification({
        title: `New Order: ${newOrder.tableNo}`,
        message: `New order request from ${newOrder.tableNo}`,
        type: 'order'
      });
    });

    socket.on("event:new", (event) => {
      toast(`New Event: ${event.title}`, { icon: "📅", duration: 5000 });
      addNotification({
        title: `New Event: ${event.title}`,
        message: event.description || "Check events page",
        type: 'event'
      });
    });

    // Also listen for Table Calls if backend emits them
    socket.on("table:call", (data) => {
      toast("Table Call!", { icon: "🔔" });
      addNotification({
        title: `Table Call: ${data.tableId}`,
        message: "Customer requested service",
        type: 'alert'
      });
    });

    return () => socket.disconnect();
  }, []);

  // Poll for orders
  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  // Update Status
  const updateOrderStatus = async (id, newStatus) => {
    try {
      let backendStatus = newStatus;
      await api.put(`/orders/${id}/status`, { status: backendStatus });
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status: backendStatus } : o));
      toast.success("Order Updated");
      fetchOrders();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update order");
    }
  };

  const addOrder = async (orderData) => {
    try {
      await api.post("/orders", orderData);
      fetchOrders();
      toast.success("Order created");
    } catch (err) {
      toast.error("Failed to create order");
    }
  };

  return (
    <OrderContext.Provider value={{ orders, updateOrderStatus, addOrder, loading, notifications, markAllRead, clearNotifications }}>
      {children}
    </OrderContext.Provider>
  );
}
