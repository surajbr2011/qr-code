import { useState } from "react";
import { X, CreditCard, Bell, CheckCircle2, Clock } from "lucide-react";

const NOTIFICATIONS = [
  {
    id: 1,
    title: "Payment Deducted",
    desc: "Payment of ₹1,200 has been deducted for Order #4023.",
    user: "System",
    time: "2 Hours ago",
    read: false,
    type: "payment"
  },
  {
    id: 2,
    title: "New Order Received",
    desc: "Table 4 has placed a new order for 5 items.",
    user: "Waiter",
    time: "3 Hours ago",
    read: false,
    type: "order"
  },
  {
    id: 3,
    title: "Shift Payment Processed",
    desc: "Daily payout has been processed successfully.",
    user: "Admin",
    time: "Yesterday",
    read: true,
    type: "payment"
  },
  {
    id: 4,
    title: "Stock Alert",
    desc: "Inventory low for: Chicken, Milk, and Cheese.",
    user: "Inventory",
    time: "Yesterday",
    read: true,
    type: "alert"
  },
  {
    id: 5,
    title: "Weekly Report Ready",
    desc: "Your weekly sales report is ready for download.",
    user: "System",
    time: "2 Days ago",
    read: true,
    type: "info"
  },
];

export default function NotificationPanel({ open, onClose }) {
  const [filter, setFilter] = useState("all");

  if (!open) return null;

  const filteredNotifications =
    filter === "all"
      ? NOTIFICATIONS
      : filter === "unread"
        ? NOTIFICATIONS.filter(n => !n.read)
        : NOTIFICATIONS.filter(n => n.read);

  const unreadCount = NOTIFICATIONS.filter(n => !n.read).length;
  const readCount = NOTIFICATIONS.filter(n => n.read).length;

  const getIcon = (type) => {
    switch (type) {
      case 'payment': return <CreditCard size={18} />;
      case 'alert': return <Bell size={18} />;
      case 'order': return <CheckCircle2 size={18} />;
      default: return <Bell size={18} />;
    }
  };

  const getIconColor = (type, read) => {
    if (read) return "bg-gray-100 text-gray-500";
    switch (type) {
      case 'payment': return "bg-red-100 text-red-600";
      case 'alert': return "bg-orange-100 text-orange-600";
      case 'order': return "bg-blue-100 text-blue-600";
      default: return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex justify-end animate-fadeIn">

      {/* PANEL */}
      <div
        className="w-full sm:w-[480px] h-full bg-white shadow-2xl animate-slideIn flex flex-col"
        style={{ boxShadow: "-10px 0 40px rgba(0,0,0,0.1)" }}
      >

        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-white/50 backdrop-blur-md sticky top-0 z-10">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Notifications</h2>
            <p className="text-sm text-gray-500">You have {unreadCount} unread messages</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-colors"
          >
            <X size={18} className="text-gray-600" />
          </button>
        </div>

        {/* STATS */}
        <div className="px-6 py-6 grid grid-cols-3 gap-4 shrink-0 bg-gray-50/50 border-b border-gray-100">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col items-center">
            <span className="text-2xl font-bold text-black">{NOTIFICATIONS.length}</span>
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide mt-1">Total</span>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col items-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full m-2"></div>
            <span className="text-2xl font-bold text-red-600">{unreadCount}</span>
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide mt-1">Unread</span>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col items-center">
            <span className="text-2xl font-bold text-gray-600">{readCount}</span>
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide mt-1">Read</span>
          </div>
        </div>

        {/* FILTERS */}
        <div className="px-6 py-4 flex gap-2 shrink-0 border-b border-gray-50">
          {['all', 'unread', 'read'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all capitalize
                ${filter === f
                  ? "bg-black text-white shadow-md transform scale-105"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"}`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* SCROLLABLE LIST */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/30 custom-scrollbar">
          {filteredNotifications.map(n => (
            <div
              key={n.id}
              className={`relative flex gap-4 p-5 rounded-2xl border transition-all duration-300 group
                ${!n.read
                  ? "bg-white border-blue-100 shadow-md translate-x-1"
                  : "bg-white border-gray-100 hover:shadow-md hover:-translate-y-0.5"}`}
            >
              {/* Unread Indicator */}
              {!n.read && (
                <div className="absolute top-5 right-5 w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              )}

              {/* ICON */}
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${getIconColor(n.type, n.read)}`}>
                {getIcon(n.type)}
              </div>

              {/* CONTENT */}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                  <h4 className={`font-semibold text-[15px] truncate pr-4 ${!n.read ? 'text-gray-900' : 'text-gray-700'}`}>
                    {n.title}
                  </h4>
                </div>

                <p className="text-sm text-gray-500 leading-relaxed line-clamp-2 mb-3">
                  {n.desc}
                </p>

                <div className="flex items-center gap-3 text-xs text-gray-400 font-medium">
                  <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-md">
                    <Clock size={12} />
                    {n.time}
                  </span>
                  <span>•</span>
                  <span>{n.user}</span>
                </div>
              </div>
            </div>
          ))}

          {filteredNotifications.length === 0 && (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Bell size={24} className="text-gray-300" />
              </div>
              <p className="font-medium">No notifications found</p>
              <p className="text-xs">You're all caught up!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
