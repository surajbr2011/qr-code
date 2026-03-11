import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import PageWrapper from "../components/PageWrapper";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../utils/api";
import socket from "../utils/socket";
import { useTheme } from "../context/ThemeContext";
import {
    ArrowLeft,
    Check,
    ChefHat,
    Utensils,
    Smile,
    Clock,
    ChevronDown,
    ChevronUp
} from "lucide-react";
import BottomNav from "../components/BottomNav";

export default function OrderTracking() {
    const navigate = useNavigate();
    const location = useLocation();
    const { theme, isAvengerMode } = useTheme();
    const [orders, setOrders] = useState([]);
    const [expandedOrder, setExpandedOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrders();

        socket.on("order:update", (updatedOrder) => {
            setOrders((prevOrders) =>
                prevOrders.map((o) =>
                    o._id === updatedOrder._id ? updatedOrder : o
                )
            );
        });

        return () => {
            socket.off("order:update");
        };
    }, []);

    const fetchOrders = async () => {
        try {
            const token = localStorage.getItem("customer_token");
            let data = [];

            if (token) {
                const res = await api.get('/orders/my-orders');
                data = res.data;
            } else if (location.state?.orderId) {
                const res = await api.get(`/orders/${location.state.orderId}`);
                data = [res.data];
            }

            setOrders(data);

            if (location.state?.orderId) {
                setExpandedOrder(location.state.orderId);
            } else if (data.length > 0) {
                // Auto expand latest active order
                const active = data.find(o => !['delivered', 'cancelled', 'completed'].includes(o.status));
                if (active) setExpandedOrder(active._id);
            }
        } catch (err) {
            console.error("Failed to fetch tracking:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <PageWrapper className={`min-h-screen flex justify-center font-sans transition-colors duration-500 ${theme.bg}`}>
                <div className="w-full max-w-[430px] min-h-screen pb-24">

                    {/* HEADER */}
                    <header className={`px-5 py-4 flex items-center gap-4 sticky top-0 z-30 shadow-sm transition-colors duration-500 ${theme.headerBg}`}>
                        <button onClick={() => navigate(-1)} className={`p-2 rounded-full transition ${isAvengerMode ? 'text-slate-300 hover:bg-slate-800' : 'text-gray-700 hover:bg-gray-100'}`}>
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <h1 className={`text-lg font-bold ${theme.text}`}>Order Tracking</h1>
                    </header>

                    <div className="px-5 mt-6 space-y-6">
                        {loading ? (
                            <div className={`text-center mt-10 text-sm animate-pulse ${theme.textSec}`}>Loading tracking details...</div>
                        ) : orders.length === 0 ? (
                            <div className={`flex flex-col items-center justify-center mt-20 ${theme.textSec}`}>
                                <Utensils className="w-12 h-12 mb-3 opacity-20" />
                                <p className="text-sm">No active orders found.</p>
                                <button onClick={() => navigate('/menu')} className={`mt-4 font-semibold text-sm ${isAvengerMode ? 'text-red-500' : 'text-orange-500'}`}>
                                    Go to Menu
                                </button>
                            </div>
                        ) : (
                            orders.map((order) => {
                                const isExpanded = expandedOrder === order._id;
                                return (
                                    <OrderCard
                                        key={order._id}
                                        order={order}
                                        expanded={isExpanded}
                                        onToggle={() => setExpandedOrder(isExpanded ? null : order._id)}
                                        theme={theme}
                                        isAvengerMode={isAvengerMode}
                                    />
                                );
                            })
                        )}
                    </div>

                </div>
            </PageWrapper>

            {/* ================= BOTTOM NAV ================= */}
            <BottomNav />
        </>
    );
}

function OrderCard({ order, expanded, onToggle, theme, isAvengerMode }) {
    // Status Logic
    const steps = [
        { key: 'confirm', label: 'Order Received', sub: 'Your order has been confirmed', icon: Check },
        { key: 'preparing', label: 'In Kitchen', sub: 'Our chefs are preparing your meal', icon: ChefHat },
        { key: 'ready', label: 'Ready', sub: 'Your order is ready to be served', icon: Utensils },
        { key: 'delivered', label: 'Served', sub: 'Enjoy your meal!', icon: Smile }
    ];

    const getCurrentStepIndex = (status) => {
        if (status === 'pending') return 0; // Treat pending as received/confirming
        if (status === 'confirm') return 0;
        if (status === 'preparing') return 1;
        if (status === 'ontheway') return 2; // Map 'ontheway' to Ready
        if (status === 'ready') return 2;
        if (status === 'delivered' || status === 'completed') return 3;
        return 0;
    };

    const currentStep = getCurrentStepIndex(order.status);

    // Calculate Dynamic ETA
    const calculateETA = () => {
        if (currentStep >= 3) return "Enjoy your meal!";
        if (currentStep === 2) return "Ready to serve!";

        // Default prep time: 20 mins
        // If we had a specific backend prep time, we'd use it.
        // For now, assume 20 mins from CreatedAt
        const created = new Date(order.createdAt);
        const now = new Date();
        const diffMins = Math.floor((now - created) / 60000);
        const standardWait = 25;

        let remaining = standardWait - diffMins;
        if (remaining < 2) remaining = 2; // Minimum valid "just a sec" wait
        if (remaining > 60) return "Delayed"; // Safety cap

        return `~${remaining} - ${remaining + 5} mins`;
    };

    const etaText = calculateETA();

    return (
        <div className={`rounded-2xl shadow-sm border overflow-hidden transition-all duration-300 ${isAvengerMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'}`}>
            {/* CARD HEADER */}
            <div
                onClick={onToggle}
                className={`p-5 flex justify-between items-center cursor-pointer transition relative z-20 ${isAvengerMode ? 'hover:bg-slate-700/50' : 'hover:bg-gray-50/50'}`}
            >
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className={`font-bold text-base ${isAvengerMode ? 'text-red-500' : 'text-orange-500'}`}>
                            Order #{order._id.slice(-6).toUpperCase()}
                        </span>
                    </div>
                    <p className={`text-xs font-medium ${theme.textSec}`}>
                        {order.tableNo} • {order.items.length} Items
                    </p>
                </div>
                <button className={`${isAvengerMode ? 'text-slate-500' : 'text-gray-400'}`}>
                    {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
            </div>

            {/* EXPANDED CONTENT */}
            {expanded && (
                <div className="px-5 pb-8 pt-2 animate-fadeIn relative z-10">

                    {/* STATUS TITLE */}
                    <h3 className={`text-sm font-bold mb-6 border-b pb-2 ${theme.text} ${isAvengerMode ? 'border-slate-700' : 'border-gray-100'}`}>
                        Order Status
                    </h3>



                    {/* TIMELINE */}
                    <div className="relative pl-1">
                        {/* Vertical Line (Background) */}
                        <div className={`absolute left-[1.3rem] top-3 bottom-10 w-[2px] -translate-x-1/2 ${isAvengerMode ? 'bg-slate-700' : 'bg-gray-100'}`}></div>

                        {/* Active Line (Animated Progress) */}
                        <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: `${(currentStep / (steps.length - 1)) * 100}%` }}
                            transition={{ duration: 1, ease: "easeInOut" }}
                            className={`absolute left-[1.3rem] top-3 w-[2px] -translate-x-1/2 max-h-[85%] ${isAvengerMode ? 'bg-gradient-to-b from-red-600 to-red-800' : 'bg-gradient-to-b from-orange-500 to-red-500'}`}
                        />

                        <div className="space-y-8">
                            {steps.map((step, index) => {
                                const isActive = index <= currentStep;
                                const isCurrent = index === currentStep;
                                const Icon = step.icon;

                                return (
                                    <motion.div
                                        key={step.key}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="flex gap-4 relative z-10 items-start group"
                                    >
                                        {/* ICON CIRCLE */}
                                        <div className="relative">
                                            {isCurrent && (
                                                <motion.div
                                                    initial={{ scale: 1 }}
                                                    animate={{ scale: [1, 1.2, 1] }}
                                                    transition={{ repeat: Infinity, duration: 2 }}
                                                    className={`absolute inset-0 rounded-full blur-md ${isAvengerMode ? 'bg-red-500/40' : 'bg-orange-200'}`}
                                                />
                                            )}
                                            <motion.div
                                                animate={isCurrent ? { scale: [1, 1.1, 1] } : { scale: 1 }}
                                                transition={{ repeat: Infinity, duration: 2 }}
                                                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 flex-shrink-0 relative z-10
                                                ${isActive
                                                        ? (isAvengerMode
                                                            ? "bg-gradient-to-br from-red-600 to-slate-900 border-slate-700 text-white shadow-lg shadow-red-500/30"
                                                            : "bg-gradient-to-br from-orange-500 to-red-500 border-white text-white shadow-lg shadow-orange-500/30")
                                                        : (isAvengerMode
                                                            ? "bg-slate-800 border-slate-700 text-slate-600"
                                                            : "bg-white border-gray-100 text-gray-300 group-hover:border-gray-200")
                                                    }`}
                                            >
                                                <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                                            </motion.div>
                                        </div>

                                        {/* TEXT */}
                                        <div className={`pt-0.5 transition-opacity duration-300 transform ${isActive ? "opacity-100" : "opacity-40 grayscale"}`}>
                                            <p className={`text-sm font-bold ${isActive ? (isAvengerMode ? "text-slate-200" : "text-gray-900") : "text-gray-400"}`}>
                                                {step.label}
                                            </p>
                                            <p className={`text-xs mt-0.5 font-medium leading-tight ${isAvengerMode ? 'text-slate-500' : 'text-gray-400'}`}>
                                                {step.sub}
                                            </p>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>

                    {/* ETA CARD */}
                    {!['served', 'Delivered', 'completed', 'delivered'].includes(order.status) && (
                        <div className={`mt-8 border rounded-xl p-4 flex flex-col items-center text-center
                             ${isAvengerMode ? 'bg-slate-900/50 border-slate-700' : 'bg-orange-50/50 border-orange-100'}`}>
                            <Clock className={`mb-2 ${isAvengerMode ? 'text-red-500' : 'text-orange-400'}`} size={20} />
                            <p className={`text-xs font-medium ${theme.textSec}`}>Estimated Time</p>
                            <p className={`text-lg font-bold mt-1 ${isAvengerMode ? 'text-red-500' : 'text-orange-600'}`}>{etaText}</p>
                        </div>
                    )}

                    {/* SERVED MSG */}
                    {['served', 'Delivered', 'completed', 'delivered'].includes(order.status) && (
                        <div className={`mt-8 border rounded-xl p-4 flex flex-col items-center text-center
                            ${isAvengerMode ? 'bg-green-900/20 border-green-900/50' : 'bg-green-50 border-green-100'}`}>
                            <Smile className="text-green-500 mb-2" size={24} />
                            <p className="text-sm font-bold text-green-600 mt-1">Enjoy your meal!</p>
                        </div>
                    )}

                </div>
            )}
        </div>
    );
}
