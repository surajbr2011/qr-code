import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PageWrapper from "../components/layout/PageWrapper";
import StatCard from "../components/cards/StatCard";
import OrderCard from "../components/cards/OrderCard";
import BarChart from "../components/charts/BarChart";
import LineChart from "../components/charts/LineChart";
import CartSummary from "../components/cards/CartSummary";
import NotificationCard from "../components/cards/NotificationCard";
import UpcomingEvents from "../components/cards/UpcomingEvents";
import {
  ChevronDown, ChevronUp, Bell, Calendar, Plus,
  ShoppingBag, IndianRupee, Utensils, Users, X, Send, ChevronRight
} from "lucide-react";
import api from "../utils/api";
import socket from "../utils/socket";
import { toast } from "react-hot-toast";

/* ================= COUNT-UP HOOK ================= */
function useCountUp(target, duration = 800) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!target) { setValue(0); return; }
    let start = 0;
    const step = Math.max(Math.floor(duration / target), 10);
    const timer = setInterval(() => {
      start += Math.ceil(target / (duration / step));
      if (start >= target) {
        start = target;
        clearInterval(timer);
      }
      setValue(start);
    }, step);
    return () => clearInterval(timer);
  }, [target, duration]);
  return value;
}

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    deliveredOrders: 0,
    salesTrend: []
  });
  const [categoryDistribution, setCategoryDistribution] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  // UI States
  const [expandTableOrders, setExpandTableOrders] = useState(false);
  const [expandRoomOrders, setExpandRoomOrders] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [isSubmittingEvent, setIsSubmittingEvent] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: '', date: '', time: '', type: 'special' });

  const fetchData = async () => {
    try {
      const results = await Promise.allSettled([
        api.get('/orders/stats'),
        api.get('/menu'),
        api.get('/orders'),
        api.get('/notifications'),
        api.get('/events')
      ]);

      const [statsRes, menuRes, ordersRes, notifRes, eventRes] = results;

      if (statsRes.status === 'fulfilled') {
        setStats(statsRes.value.data);
        setRecentOrders(statsRes.value.data.recentOrders || []);
      } else {
        console.error('Stats fetch failed:', statsRes.reason);
      }

      if (notifRes.status === 'fulfilled') {
        console.log("NOTIF FETCH SUCCESS:", notifRes.value.data);
        setNotifications(notifRes.value.data.notifications?.slice(0, 6) || []);
      } else {
        console.error('Notifications fetch failed:', notifRes.reason);
      }

      if (eventRes.status === 'fulfilled') {
        setEvents(eventRes.value.data || []);
      } else {
        console.error('Events fetch failed:', eventRes.reason);
      }

      if (menuRes.status === 'fulfilled' && ordersRes.status === 'fulfilled') {
        const categoryData = processCategoryData(ordersRes.value.data, menuRes.value.data);
        setCategoryDistribution(categoryData);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    socket.on('notification:new', (notif) => {
      setNotifications(prev => [notif, ...prev.slice(0, 5)]);
    });

    socket.on('order:new', (order) => {
      fetchData();
      toast.success(`New order from Table ${order.tableNo}`, { duration: 5000 });
    });

    socket.on('event:new', (event) => {
      setEvents(prev => [...prev, event].sort((a, b) => new Date(a.date) - new Date(b.date)));
    });

    // Support Chat Listeners
    // NOTE: 'notification:new' now handles the actual dashboard cards/alerts for support.
    // We keep these purely if we wanted to auto-refresh data, but currently notification:new is sufficient for Alerts.

    return () => {
      socket.off('notification:new');
      socket.off('order:new');
      socket.off('event:new');
    };
  }, []);

  const processCategoryData = (ordersData, menuData) => {
    const DRINKS_CATEGORIES = ["alcoholic beverages", "beverages (non-alcohol)", "spirits", "drinks"];
    const DRINKS_SUBCATEGORIES = ["mocktails", "cold stuff", "tea", "coffee", "juice", "shake", "smoothies", "lassi", "milk"];

    const categoryTotals = { "Veg": 0, "Non-Veg": 0, "Drinks": 0 };
    const menuLookup = {};

    menuData.forEach(item => {
      let fType = "veg";
      if (item.foodType) {
        fType = item.foodType.toLowerCase();
      } else {
        fType = item.veg ? "veg" : "nonveg";
      }

      menuLookup[item.name.toLowerCase()] = {
        category: (item.category || "").toLowerCase(),
        subCategory: (item.subCategory || "").toLowerCase(),
        foodType: fType
      };
    });

    ordersData.forEach(o => {
      o.items.forEach(it => {
        const itemName = (it.name || "").toLowerCase();
        const itemInfo = menuLookup[itemName];
        const storedType = (it.foodType || "").toLowerCase();
        const storedCat = (it.category || "").toLowerCase();
        const storedSubCat = (it.subCategory || "").toLowerCase();

        let type = "Veg"; // Default

        // 1. Check for Drinks
        const isDrinkCategory = DRINKS_CATEGORIES.includes(storedCat) || (itemInfo && DRINKS_CATEGORIES.includes(itemInfo.category));
        const isDrinkSubCategory = DRINKS_SUBCATEGORIES.includes(storedSubCat) || (itemInfo && DRINKS_SUBCATEGORIES.includes(itemInfo.subCategory));

        if (storedCat === "drinks" || isDrinkCategory || isDrinkSubCategory) {
          type = "Drinks";
        }
        // 2. Check for Non-Veg
        else if (storedType === "nonveg" || storedType === "non-veg" ||
          (itemInfo && (itemInfo.foodType === "nonveg" || itemInfo.foodType === "non-veg"))) {
          type = "Non-Veg";
        }
        // 3. Fallback / Keyword Check
        else {
          // Default is Veg, but check keywords just in case
          if (itemName.includes("non-veg") || itemName.includes("chicken") || itemName.includes("mutton") || itemName.includes("fish") || itemName.includes("prawn")) {
            type = "Non-Veg";
          } else {
            type = "Veg";
          }
        }

        categoryTotals[type] = (categoryTotals[type] || 0) + (it.quantity || 1);
      });
    });

    const totalItems = Object.values(categoryTotals).reduce((a, b) => a + b, 0);
    const colorMap = { "Veg": "#22c55e", "Non-Veg": "#ef4444", "Drinks": "#f59e0b" };

    return Object.entries(categoryTotals)
      .filter(([_, val]) => val > 0 || totalItems === 0)
      .map(([name, val]) => ({
        name,
        value: totalItems > 0 ? Math.round((val / totalItems) * 100) : 0,
        color: colorMap[name]
      }));
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    if (!newEvent.title || !newEvent.date) return;
    setIsSubmittingEvent(true);
    try {
      await api.post('/events', newEvent);
      toast.success("Event created successfully");
      setShowEventModal(false);
      setNewEvent({ title: '', date: '', time: '', type: 'special' });
    } catch (err) {
      toast.error("Failed to create event");
    } finally {
      setIsSubmittingEvent(false);
    }
  };

  const navigate = useNavigate();
  const handleNotificationClick = (notif) => {
    // 1. Support Logic
    if (notif.ticketId || (notif.title && (notif.title.includes('Support') || notif.title.includes('Message')))) {
      navigate('/support', { state: { ticketId: notif.ticketId } });
      return;
    }

    // 2. Order Logic
    if (notif.orderId || (notif.title && notif.title.includes('Order'))) {
      navigate('/orders'); // Or specific order detail if we had a route
      return;
    }
  };

  const totalCount = useCountUp(stats.totalOrders);
  const deliveredCount = useCountUp(stats.deliveredOrders);
  const pendingCount = useCountUp(stats.pendingOrders);
  const revenueCount = useCountUp(stats.totalRevenue);

  if (loading) return <div className="h-screen flex items-center justify-center">Loading dashboard...</div>;

  return (
    <PageWrapper>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>

      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Orders" value={totalCount} trend="+12% from last week" />
        <StatCard title="Delivered" value={deliveredCount} trend="+8% from yesterday" />
        <StatCard title="Pending" value={pendingCount} color="text-orange-500" />
        <StatCard title="Total Revenue" value={`₹${revenueCount.toLocaleString()}`} trend="+15% this month" />
      </div>

      {/* FILTERS */}
      <div className="flex flex-wrap gap-2 sm:gap-3 mb-8">
        {["all", "confirmed", "pending", "delivered"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 sm:px-6 py-2 rounded-full text-xs sm:text-sm font-bold transition-all
                            ${filter === f ? "bg-black text-white shadow-lg scale-105" : "bg-white border text-gray-500 hover:bg-gray-50"}`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* ORDERS SECTIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
        {/* Tables */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <span className="px-4 py-1.5 bg-gray-50 text-gray-500 rounded-full text-[10px] font-bold uppercase tracking-widest">Table Orders</span>
            <ChevronRight size={18} className="text-gray-300" />
          </div>
          <div className="space-y-4">
            {recentOrders.filter(o => {
              const s = (o.status || "").toLowerCase();
              if (o.tableNo.toLowerCase().includes('room')) return false;
              if (filter === 'all') return true;
              if (filter === 'pending') return s === 'pending';
              if (filter === 'confirmed') return ['confirm', 'confirmed', 'preparing', 'ready', 'ontheway'].includes(s);
              if (filter === 'delivered') return ['delivered', 'done', 'completed'].includes(s);
              return s === filter;
            })
              .slice(0, expandTableOrders ? undefined : 3)
              .map((order, index) => (
                <OrderCard
                  key={order._id || index}
                  title={`Table ${order.tableNo}`}
                  items={`₹${order.totalAmount} (${order.items.length} items)`}
                  status={order.status}
                />
              ))}
            <button onClick={() => setExpandTableOrders(!expandTableOrders)} className="w-full py-2 text-xs font-bold text-gray-400 hover:text-black transition-colors flex items-center justify-center gap-1">
              {recentOrders.filter(o => {
                const s = (o.status || "").toLowerCase();
                if (o.tableNo.toLowerCase().includes('room')) return false;
                if (filter === 'all') return true;
                if (filter === 'pending') return s === 'pending';
                if (filter === 'confirmed') return ['confirm', 'confirmed'].includes(s);
                if (filter === 'preparing') return ['preparing', 'ready', 'ontheway'].includes(s);
                if (filter === 'delivered') return ['delivered', 'done', 'completed'].includes(s);
                return s === filter;
              }).length > 3 && (
                  expandTableOrders ? "Show Less" : "View All"
                )} {expandTableOrders ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </div>
        </div>

        {/* Rooms */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <span className="px-4 py-1.5 bg-gray-50 text-gray-500 rounded-full text-[10px] font-bold uppercase tracking-widest">Room Orders</span>
            <ChevronRight size={18} className="text-gray-300" />
          </div>
          <div className="space-y-4">
            {recentOrders.filter(o => {
              const s = (o.status || "").toLowerCase();
              if (!o.tableNo.toLowerCase().includes('room')) return false;
              if (filter === 'all') return true;
              if (filter === 'pending') return s === 'pending';
              if (filter === 'confirmed') return ['confirm', 'confirmed', 'preparing', 'ready', 'ontheway'].includes(s);
              if (filter === 'delivered') return ['delivered', 'done', 'completed'].includes(s);
              return s === filter;
            })
              .slice(0, expandRoomOrders ? undefined : 3)
              .map((order, index) => (
                <OrderCard
                  key={order._id || index}
                  title={order.tableNo}
                  items={`₹${order.totalAmount} (${order.items.length} items)`}
                  status={order.status}
                />
              ))}
            <button onClick={() => setExpandRoomOrders(!expandRoomOrders)} className="w-full py-2 text-xs font-bold text-gray-400 hover:text-black transition-colors flex items-center justify-center gap-1">
              {recentOrders.filter(o => {
                const s = (o.status || "").toLowerCase();
                if (!o.tableNo.toLowerCase().includes('room')) return false;
                if (filter === 'all') return true;
                if (filter === 'pending') return s === 'pending';
                if (filter === 'processing') return ['confirm', 'confirmed', 'preparing', 'ready', 'ontheway'].includes(s);
                if (filter === 'delivered') return ['delivered', 'done', 'completed'].includes(s);
                return s === filter;
              }).length > 3 && (
                  expandRoomOrders ? "Show Less" : "View All"
                )} {expandRoomOrders ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </div>
        </div>
      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <LineChart
          data={stats.salesTrend?.map(d => ({ name: d._id.slice(5), value: d.revenue })) || []}
          title="Revenue Performance"
        />
        <BarChart
          data={stats.salesTrend?.map(d => ({ name: d._id.slice(5), value: d.orders })) || []}
          title="Daily Order Volume"
          color="#10B981"
        />
      </div>

      {/* DISTRIBUTION + EVENTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
        <CartSummary data={categoryDistribution} />
        <UpcomingEvents events={events} onAdd={() => setShowEventModal(true)} />
      </div>

      {/* NOTIFICATIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <NotificationCard
          title="Guest Alerts"
          notifications={notifications.filter(n => n.type === 'order' || (n.type === 'alert' && !n.title.toLowerCase().includes('staff')))}
          onNotificationClick={handleNotificationClick}
        />
        <NotificationCard
          title="Staff Activity"
          notifications={notifications.filter(n => n.type === 'system' || (n.type === 'alert' && n.title.toLowerCase().includes('staff')))}
          onNotificationClick={handleNotificationClick}
        />
      </div>

      {/* EVENT MODAL */}
      {showEventModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-scaleIn">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Add New Event</h2>
              <button onClick={() => setShowEventModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={20} /></button>
            </div>
            <form onSubmit={handleCreateEvent} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Title</label>
                <input
                  type="text" required
                  className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-black outline-none transition-all"
                  value={newEvent.title}
                  onChange={e => setNewEvent({ ...newEvent, title: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Date</label>
                  <input
                    type="date" required
                    className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-black outline-none transition-all"
                    value={newEvent.date}
                    onChange={e => setNewEvent({ ...newEvent, date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Time</label>
                  <input
                    type="text" placeholder="e.g. 7:00 PM"
                    className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-black outline-none transition-all"
                    value={newEvent.time}
                    onChange={e => setNewEvent({ ...newEvent, time: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Type</label>
                <select
                  className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-black outline-none transition-all appearance-none"
                  value={newEvent.type}
                  onChange={e => setNewEvent({ ...newEvent, type: e.target.value })}
                >
                  <option value="special">Special Event</option>
                  <option value="promotion">Promotion</option>
                  <option value="holiday">Holiday</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>
              <button
                type="submit" disabled={isSubmittingEvent}
                className="w-full bg-black text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-900 transition-all disabled:opacity-50 mt-4 shadow-xl"
              >
                {isSubmittingEvent ? "Saving..." : <><Plus size={20} /> Create Event</>}
              </button>
            </form>
          </div>
        </div>
      )}
    </PageWrapper>
  );
};

export default Dashboard;
