import React, { useState, useEffect } from "react";
import PageWrapper from "../../components/PageWrapper";
import { FiChevronLeft, FiCalendar } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api";

export default function Events() {
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const { data } = await api.get('/events');
                setEvents(data || []);
            } catch (err) {
                console.error("Failed to fetch events");
            } finally {
                setLoading(false);
            }
        };
        fetchEvents();
    }, []);

    const getTypeColor = (type) => {
        switch (type) {
            case 'promotion': return 'bg-purple-100 text-purple-600';
            case 'maintenance': return 'bg-red-100 text-red-600';
            case 'holiday': return 'bg-blue-100 text-blue-600';
            default: return 'bg-orange-100 text-orange-600';
        }
    };

    return (
        <PageWrapper className="min-h-screen bg-[#F5F7FB] max-w-[430px] mx-auto overflow-y-auto pb-20">
            {/* Header */}
            <div className="bg-white px-4 py-4 flex items-center justify-between shadow-sm sticky top-0 z-10 border-b border-gray-100">
                <button onClick={() => navigate(-1)} className="p-1">
                    <FiChevronLeft size={28} className="text-black" />
                </button>
                <h1 className="text-xl font-bold text-black flex-1 text-center pr-8">Upcoming Events</h1>
            </div>

            <div className="p-6">
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <p className="text-gray-500 font-medium">Loading events...</p>
                    </div>
                ) : events.length > 0 ? (
                    <div className="space-y-4">
                        {events.map((e) => (
                            <div key={e._id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-50 flex gap-4 items-center animate-card">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${getTypeColor(e.type)}`}>
                                    <FiCalendar size={24} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-base text-gray-900 truncate">{e.title}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-tight">
                                            {new Date(e.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                                        </p>
                                        <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-tight">
                                            {e.time || 'All Day'}
                                        </p>
                                    </div>
                                    {e.description && (
                                        <p className="text-sm text-gray-500 mt-2 line-clamp-2 leading-relaxed">
                                            {e.description}
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <FiCalendar size={32} className="text-gray-300" />
                        </div>
                        <p className="text-gray-500 font-bold">No events scheduled</p>
                        <p className="text-sm text-gray-400 mt-1">Check back later for updates</p>
                    </div>
                )}
            </div>
        </PageWrapper>
    );
}
