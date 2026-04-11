import { Bell, Search, Menu, LogOut, ChevronDown, X } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { Icon } from "@iconify/react";
import socket from "../../utils/socket";
import toast from "react-hot-toast";
import NotificationsModal from "../modals/NotificationsModal";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";

export default function Header({ onSearch, onToggleSidebar }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const isDashboard = location.pathname === "/dashboard";
  const [showQuickBill, setShowQuickBill] = useState(false);
  const qbContainerRef = useRef(null);
  const searchContainerRef = useRef(null);
  const profileRef = useRef(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // SEARCH STATE
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  // NOTIFICATION STATE
  const [notifications, setNotifications] = useState([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  // AUDIO
  // Simple cheerful chime base64
  const audioRef = useRef(new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3"));

  const searchablePages = [
    { label: "Dashboard", path: "/dashboard", icon: "mdi:view-dashboard" },
    { label: "Profile", icon: "mdi:account-badge-outline", path: "/profile" },
    { label: "Quick Bill", icon: "mdi:credit-card-outline", path: "/tables" },
    { label: "Receipt", icon: "mdi:cash-register", path: "/receipt" },
    { label: "Order Management", icon: "mdi:chef-hat", path: "/order" },
    { label: "Expense Tracking", icon: "mdi:chart-bar", path: "/expenses" },
    { label: "Reports", icon: "mdi:clipboard-text-outline", path: "/reports" },
    { label: "Menu Management", icon: "mdi:silverware-fork-knife", path: "/menu-management" },
    { label: "Staff Management", icon: "mdi:account-group-outline", path: "/staff" },
    { label: "QR Management", icon: "mdi:qrcode-scan", path: "/qr" },
    { label: "General Setting", icon: "mdi:cog-outline", path: "/general" },
    { label: "Support", icon: "mdi:headset", path: "/support" },
    { label: "Order Tracking", icon: "mdi:clipboard-text-clock-outline", path: "/orders" }
  ];

  useEffect(() => {
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

    // Update Token & Connect
    const token = localStorage.getItem("admin_token");
    if (token) {
      socket.auth.token = token;
      if (!socket.connected) {
        socket.connect();
      }
    }

    // Initial Fetch
    const fetchNotifications = async () => {
      try {
        const notifRes = await fetch(`${API_URL}/notifications`);
        if (notifRes.ok) {
          const notifData = await notifRes.json();
          setNotifications(notifData.notifications || []);
        }
      } catch (err) {
        console.error("Fetch error", err);
      }
    };
    fetchNotifications();

    // Listeners
    const handleNewNotification = (notif) => {
      setNotifications(prev => [notif, ...prev]);

      // Play Sound
      try {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(e => console.log("Audio play failed", e));
      } catch (e) {
        console.log("Audio error", e);
      }

      toast.custom((t) => (
        <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}>
          <div className="flex-1 w-0 p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 pt-0.5">
                <Bell className="h-10 w-10 text-blue-500 bg-blue-50 rounded-full p-2" />
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-900">{notif.title}</p>
                <p className="mt-1 text-sm text-gray-500">{notif.message}</p>
              </div>
            </div>
          </div>
        </div>
      ), { duration: 4000 });
    };

    socket.on("notification:new", handleNewNotification);

    return () => {
      socket.off("notification:new", handleNewNotification);
    };
  }, []);

  const markAsRead = async (id) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";
      await fetch(`${API_URL}/notifications/${id}/read`, { method: 'PUT' });
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error("Error marking read", err);
    }
  };

  const deleteNotification = async (id) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";
      await fetch(`${API_URL}/notifications/${id}`, { method: 'DELETE' });
      setNotifications(prev => prev.filter(n => n._id !== id));
      toast.success("Notification deleted");
    } catch (err) {
      console.error("Error deleting notification", err);
      toast.error("Failed to delete");
    }
  };

  const clearAllNotifications = async () => {
    try {
      if (!window.confirm("Are you sure you want to clear all notifications?")) return;
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";
      await fetch(`${API_URL}/notifications`, { method: 'DELETE' });
      setNotifications([]);
      toast.success("All notifications cleared");
    } catch (err) {
      console.error("Error clearing notifications", err);
      toast.error("Failed to clear all");
    }
  };


  useEffect(() => {
    function onDocClick(e) {
      if (qbContainerRef.current && !qbContainerRef.current.contains(e.target)) {
        setShowQuickBill(false);
      }
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setShowSearchDropdown(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const handleSearch = (val) => {
    setQuery(val);
    if (onSearch) {
      onSearch(val);
    }

    if (!val.trim()) {
      setSearchResults([]);
      setShowSearchDropdown(false);
      return;
    }

    const lower = val.toLowerCase();
    const matches = searchablePages.filter(p =>
      p.label.toLowerCase().includes(lower)
    );
    setSearchResults(matches);
    setShowSearchDropdown(true);
  };

  const handleNavigate = (path) => {
    navigate(path);
    setQuery("");
    setSearchResults([]);
    setShowSearchDropdown(false);
    if (onSearch) onSearch(""); // Clear page search too if we navigate away (conceptually)
  };

  return (
    <>
      <header className="h-16 bg-white border-b border-[var(--border-light)] flex items-center justify-between px-4 md:px-6 sticky top-0 z-40">

        <div className="flex items-center gap-4 flex-1">
          {/* Mobile Menu Button */}
          <button
            onClick={onToggleSidebar}
            className="md:hidden p-1 hover:bg-gray-100 rounded-lg text-gray-600"
          >
            <Menu size={24} />
          </button>

          {/* Search */}
          <div className="relative w-full max-w-[180px] md:max-w-[400px] md:w-1/2" ref={searchContainerRef}>
            <Search
              size={15}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-gray)]"
            />

            <input
              type="text"
              placeholder="Search..."
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              onFocus={() => { if (query && searchResults.length > 0) setShowSearchDropdown(true); }}
              className="
              w-full
              h-9
              pl-10 pr-8
              rounded-full
              bg-[#F3F4F6]
              text-sm
              text-[var(--text-dark)]
              placeholder:text-[var(--text-gray)]
              outline-none
              transition-all
            "
            />
            {query && (
              <button
                onClick={() => handleSearch("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-black transition-colors"
                title="Clear search"
              >
                <X size={15} />
              </button>
            )}

            {/* Search Dropdown */}
            <AnimatePresence>
              {showSearchDropdown && searchResults.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className="absolute top-full left-0 w-full mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50"
                >
                  <p className="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider bg-gray-50 border-b border-gray-100">
                    Navigate To
                  </p>
                  <div className="max-h-[300px] overflow-y-auto">
                    {searchResults.map((page) => (
                      <button
                        key={page.path}
                        onClick={() => handleNavigate(page.path)}
                        className="w-full text-left px-4 py-3 hover:bg-blue-50 flex items-center gap-3 transition-colors group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                          <Icon icon={page.icon} width={18} className="text-gray-500 group-hover:text-blue-600" />
                        </div>
                        <div>
                          <span className="text-sm font-semibold text-gray-700 group-hover:text-blue-700 block">
                            {page.label}
                          </span>
                          <span className="text-[10px] text-gray-400 group-hover:text-blue-400">
                            Go to {page.label}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2 md:gap-4">
          {isDashboard && (
            <div className="relative" ref={qbContainerRef}>
              <button onClick={() => setShowQuickBill((s) => !s)} className="bg-[var(--primary)] text-white p-2 md:px-4 md:py-1.5 rounded-full text-sm font-medium flex items-center gap-2 group transition-all">
                <span className="hidden md:inline">Quick Bill</span>
                <Icon icon="mdi:flash" width={18} className="md:hidden" />
                <Icon icon="mdi:chevron-down" width={16} className={`transform transition ${showQuickBill ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {showQuickBill && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -5 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -5 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    role="menu"
                    aria-orientation="vertical"
                    className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl ring-1 ring-black/5 z-50 py-2 overflow-hidden border border-gray-100"
                  >
                    <button
                      onClick={() => { setShowQuickBill(false); navigate('/tables', { state: { mode: 'dine' } }); }}
                      className="w-full group/item flex items-center gap-3 text-left px-4 py-3 hover:bg-blue-50 transition-colors relative overflow-hidden"
                    >
                      <div className="p-2 rounded-full bg-gray-50 group-hover/item:bg-blue-100 transition-colors">
                        <Icon icon="mdi:table-chair" width={18} className="text-gray-500 group-hover/item:text-blue-600 transition-colors" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-gray-700 group-hover/item:text-blue-700">Dine In</span>
                        <span className="text-[10px] text-gray-400 group-hover/item:text-blue-400">Table Service</span>
                      </div>
                    </button>

                    <button
                      onClick={() => { setShowQuickBill(false); navigate('/menu', { state: { mode: 'takeaway' } }); }}
                      className="w-full group/item flex items-center gap-3 text-left px-4 py-3 hover:bg-amber-50 transition-colors relative overflow-hidden"
                    >
                      <div className="p-2 rounded-full bg-gray-50 group-hover/item:bg-amber-100 transition-colors">
                        <Icon icon="mdi:bag-personal" width={18} className="text-gray-500 group-hover/item:text-amber-600 transition-colors" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-gray-700 group-hover/item:text-amber-700">Take Away</span>
                        <span className="text-[10px] text-gray-400 group-hover/item:text-amber-400">Pack & Go</span>
                      </div>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          <button
            onClick={() => setIsNotifOpen(true)}
            className="relative p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <Bell size={20} className="text-[var(--text-gray)]" />
            {notifications.some(n => !n.isRead) && (
              <span className="absolute top-0 right-0 inline-flex items-center justify-center min-w-[16px] h-4 px-1 text-[10px] font-bold leading-none text-white bg-red-500 rounded-full ring-2 ring-white">
                {notifications.filter(n => !n.isRead).length > 9 ? '9+' : notifications.filter(n => !n.isRead).length}
              </span>
            )}
          </button>

          {/* Admin Profile + Logout Dropdown (BUG-032) */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setShowProfileMenu((s) => !s)}
              className="flex items-center gap-2 p-1 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Profile menu"
            >
              <img
                src="https://i.pravatar.cc/40"
                alt="admin"
                className="w-8 h-8 rounded-full"
              />
              <span className="text-sm font-medium text-[var(--text-dark)] hidden md:inline">
                {user?.name || 'Admin'}
              </span>
              <ChevronDown size={14} className={`text-gray-400 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {showProfileMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -5 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -5 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-xl ring-1 ring-black/5 z-50 py-1 overflow-hidden border border-gray-100"
                >
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-xs font-bold text-gray-800 truncate">{user?.name || 'Admin'}</p>
                    <p className="text-[10px] text-gray-400 truncate">{user?.email || ''}</p>
                  </div>
                  <button
                    id="logout-btn"
                    onClick={() => {
                      logout();
                      navigate('/login');
                      toast.success('Logged out successfully');
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut size={16} />
                    <span className="font-medium">Logout</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* Notification Modal */}
      <NotificationsModal
        isOpen={isNotifOpen}
        onClose={() => setIsNotifOpen(false)}
        notifications={notifications}
        markAsRead={markAsRead}
        onDelete={deleteNotification}
        onClearAll={clearAllNotifications}
      />
    </>
  );
}
