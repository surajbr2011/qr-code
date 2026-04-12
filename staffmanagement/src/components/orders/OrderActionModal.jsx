import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChefHat, Bike, CheckCircle } from "lucide-react";

export default function OrderActionModal({ isOpen, onClose, order, onUpdateStatus }) {
    if (!isOpen || !order) return null;

    const getNextStatusOptions = () => {
        switch (order.status) {
            case "confirm":
                return [
                    {
                        id: "preparing",
                        label: "Move to Preparing",
                        icon: <ChefHat size={20} />,
                        color: "bg-orange-500 text-white",
                    },
                ];
            case "preparing":
                return [
                    {
                        id: "delivered",
                        label: "Move to Delivered",
                        icon: <CheckCircle size={20} />,
                        color: "bg-green-500",
                    },
                ];
            case "delivered":
                return [];
            default:
                return [];
        }
    };

    const options = getNextStatusOptions();

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="fixed inset-0 z-[9999] flex items-end justify-center bg-black/40 backdrop-blur-[2px] p-0"
                >
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{
                            type: "spring",
                            stiffness: 400,
                            damping: 40,
                            mass: 0.8
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full max-w-[430px] bg-white rounded-t-[32px] p-6 pb-12 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.2)]"
                    >
                        {/* BOTTOM SHEET HANDLE */}
                        <div className="flex justify-center mb-6">
                            <div className="w-12 h-1.5 bg-gray-200 rounded-full" />
                        </div>

                        {/* Header */}
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h3 className="text-xl font-extrabold text-gray-900 tracking-tight">Update Status</h3>
                                <div className="flex items-center gap-2 mt-1.5">
                                    <span className="px-2 py-0.5 bg-gray-100 rounded text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                                        #{order.id.slice(-6)}
                                    </span>
                                    <span className="text-gray-300">•</span>
                                    <p className="text-xs font-semibold text-gray-500">
                                        {order.room}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 text-gray-400 hover:bg-gray-100 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Options */}
                        <div className="space-y-4">
                            {options.length > 0 ? (
                                options.map((option) => (
                                    <motion.button
                                        key={option.id}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => {
                                            onUpdateStatus(order.id, option.id);
                                            onClose();
                                        }}
                                        className={`w-full flex items-center justify-between p-5 rounded-2xl text-white font-bold shadow-lg shadow-orange-500/20 active:shadow-none transition-all relative overflow-hidden group ${option.color}`}
                                    >
                                        {/* UNIQUE GLOW EFFECT */}
                                        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                        <div className="flex items-center gap-4 relative z-10">
                                            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                                                {option.icon}
                                            </div>
                                            <span className="text-base">{option.label}</span>
                                        </div>

                                        <motion.div
                                            animate={{ x: [0, 5, 0] }}
                                            transition={{ repeat: Infinity, duration: 1.5 }}
                                            className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center relative z-10"
                                        >
                                            <CheckCircle size={16} className="text-white" />
                                        </motion.div>
                                    </motion.button>
                                ))
                            ) : (
                                <div className="text-center py-8 text-gray-400 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                    <p className="text-sm font-medium">No actions available for this order</p>
                                </div>
                            )}
                        </div>


                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
