import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCheck, Bell, Clock } from "lucide-react";
import { useOrders } from "../context/OrderContext";

export default function NotificationPanel({ isOpen, onClose }) {
    const { notifications, markAllRead, clearNotifications } = useOrders();

    // Auto-mark read on open? Or manual? 
    // Let's keep it manual or just visual for now.

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[60]"
                    />

                    {/* Panel */}
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="fixed top-0 right-0 h-full w-[85%] max-w-[320px] bg-white shadow-2xl z-[70] flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <div className="flex items-center gap-2">
                                <Bell size={20} className="text-black" />
                                <h2 className="font-bold text-lg text-black">Notifications</h2>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition">
                                <X size={20} className="text-gray-500" />
                            </button>
                        </div>

                        {/* Actions */}
                        {notifications.length > 0 && (
                            <div className="px-4 py-2 flex justify-between items-center border-b border-gray-100 bg-white">
                                <span className="text-xs text-gray-500 font-medium">{notifications.length} Alerts</span>
                                <div className="flex gap-3">
                                    <button onClick={markAllRead} className="text-xs font-bold text-blue-600 hover:underline">
                                        Mark Read
                                    </button>
                                    <button onClick={clearNotifications} className="text-xs font-bold text-red-500 hover:underline">
                                        Clear All
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* List */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            {notifications.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-3">
                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                                        <Bell size={32} className="text-gray-300" />
                                    </div>
                                    <p className="text-sm font-medium">No new notifications</p>
                                </div>
                            ) : (
                                notifications.map((notif) => (
                                    <div
                                        key={notif.id}
                                        className={`flex gap-3 p-3 rounded-xl border ${notif.read ? 'bg-white border-gray-100 opacity-60' : 'bg-blue-50 border-blue-100'} transition-all`}
                                    >
                                        <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${notif.read ? 'bg-gray-300' : 'bg-blue-500'}`} />
                                        <div className="flex-1">
                                            <h4 className={`text-sm font-bold ${notif.read ? 'text-gray-700' : 'text-black'}`}>{notif.title}</h4>
                                            <p className="text-xs text-gray-500 mt-1 leading-relaxed">{notif.message}</p>
                                            <div className="flex items-center gap-1 mt-2 text-[10px] text-gray-400">
                                                <Clock size={10} />
                                                <span>{notif.time}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
