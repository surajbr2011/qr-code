import React, { useState, useEffect } from "react";
import PageWrapper from "../../components/PageWrapper";
import { ChevronLeft, Bell, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api";
import NotificationPanel from "../../components/NotificationPanel";

export default function QuickBill() {
    const navigate = useNavigate();
    const options = [
        {
            id: "dine-in",
            label: "Dine In",
            image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=500"
        },
        {
            id: "self-service",
            label: "Take Away",
            image: "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?auto=format&fit=crop&q=80&w=500"
        },
        {
            id: "room",
            label: "Room",
            image: "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&q=80&w=500"
        },
    ];

    // Notification State
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    // Optional: Get notifications for badge
    // import { useOrders } from "../../context/OrderContext";
    // const { notifications } = useOrders(); 
    // Wait, need to add import useOrders first if I use it. 
    // Let me add imports in the top replacement logic or just assume I can replace the whole file or part.
    // I will use replace_file_content carefully. 
    // Let's replace the whole component to be safe and clean.

    return (
        <PageWrapper className="min-h-screen bg-gray-50 max-w-[430px] mx-auto overflow-y-auto pb-20">
            {/* Header */}
            <div className="bg-white px-4 py-4 flex items-center justify-between shadow-sm sticky top-0 z-10">
                <button onClick={() => navigate(-1)} className="p-1 -ml-1">
                    <ChevronLeft size={28} className="text-black" strokeWidth={1.5} />
                </button>
                <h1 className="text-xl font-bold text-black">Quick Bill</h1>
                <button
                    onClick={() => setIsNotifOpen(true)}
                    className="p-1 relative"
                >
                    <Bell size={24} className="text-black" />
                    {/* Optional Badge */}
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                </button>
            </div>

            {/* Grid Content */}
            <div className="p-6 grid grid-cols-2 gap-6">
                {options.map((option) => (
                    <div
                        key={option.id}
                        className="flex flex-col items-center"
                        onClick={() => {
                            if (option.id === 'dine-in') {
                                navigate('/staff/table-room', { state: { activeTab: 'Table' } });
                            } else if (option.id === 'room') {
                                navigate('/staff/table-room', { state: { activeTab: 'Rooms' } });
                            } else if (option.id === 'self-service') {
                                navigate('/staff/menu', { state: { room: 'Take Away', type: 'self-service' } });
                            }
                        }}
                    >
                        {/* Card */}
                        <div className="bg-white rounded-2xl shadow-md overflow-hidden aspect-[4/3] w-full mb-3 cursor-pointer hover:shadow-lg transition-shadow">
                            <img
                                src={option.image}
                                alt={option.label}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        {/* Label */}
                        <span className="text-sm font-medium text-black">
                            {option.label}
                        </span>
                    </div>
                ))}
            </div>

            {/* Notification Panel */}
            <NotificationPanel isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />
        </PageWrapper>
    );
}
