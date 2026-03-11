import { useState, useEffect } from 'react';
import { X, Bell, CreditCard, CheckCircle, Info, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function NotificationsModal({ isOpen, onClose, notifications, markAsRead, onDelete, onClearAll }) {
    const [activeTab, setActiveTab] = useState('All');

    if (!isOpen) return null;

    const unreadCount = notifications.filter(n => !n.isRead).length;
    const readCount = notifications.filter(n => n.isRead).length;

    const filteredNotifications = notifications.filter(n => {
        if (activeTab === 'All') return true;
        if (activeTab === 'Unread') return !n.isRead;
        if (activeTab === 'Read') return n.isRead;
        return true;
    });

    const getIcon = (type) => {
        switch (type) {
            case 'payment': return <CreditCard className="text-red-500" size={20} />;
            case 'order': return <CheckCircle className="text-blue-500" size={20} />;
            default: return <Info className="text-gray-500" size={20} />;
        }
    };

    const getBgColor = (type) => {
        switch (type) {
            case 'payment': return 'bg-red-100';
            case 'order': return 'bg-blue-100';
            default: return 'bg-gray-100';
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">

                {/* HEAD */}
                <div className="p-6 border-b border-gray-100 flex justify-between items-start">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Notifications</h2>
                        <div className="flex items-center gap-2 mt-1">
                            <p className="text-sm text-gray-500">You have {unreadCount} unread messages</p>
                            {notifications.length > 0 && (
                                <button onClick={onClearAll} className="text-xs text-red-500 font-bold hover:underline ml-2">
                                    Clear All
                                </button>
                            )}
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                {/* KPI CARDS */}
                <div className="grid grid-cols-3 gap-4 p-6 bg-gray-50 border-b border-gray-100">
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center">
                        <span className="text-2xl font-bold text-gray-900">{notifications.length}</span>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">TOTAL</span>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center relative">
                        {unreadCount > 0 && <span className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full"></span>}
                        <span className="text-2xl font-bold text-red-500">{unreadCount}</span>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">UNREAD</span>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center">
                        <span className="text-2xl font-bold text-gray-900">{readCount}</span>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">READ</span>
                    </div>
                </div>

                {/* TABS */}
                <div className="flex gap-2 p-4 px-6 border-b border-gray-100 bg-white">
                    {['All', 'Unread', 'Read'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${activeTab === tab
                                ? 'bg-black text-white shadow-md'
                                : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* LIST */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/50">
                    {filteredNotifications.length > 0 ? filteredNotifications.map((n) => (
                        <div
                            key={n._id}
                            onClick={() => markAsRead(n._id)}
                            className={`
                                relative group p-4 rounded-xl border transition-all cursor-pointer
                                ${n.isRead
                                    ? 'bg-white border-gray-100 opacity-60 hover:opacity-100'
                                    : 'bg-white border-blue-100 shadow-sm ring-1 ring-blue-500/10'
                                }
                            `}
                        >
                            {!n.isRead && <span className="absolute top-4 right-4 w-2 h-2 bg-blue-500 rounded-full"></span>}

                            {/* DELETE BUTTON */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete(n._id);
                                }}
                                className="absolute top-4 right-8 p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Delete"
                            >
                                <Trash2 size={16} />
                            </button>

                            <div className="flex gap-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${getBgColor(n.type)}`}>
                                    {getIcon(n.type)}
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-gray-900 text-sm">{n.title}</h4>
                                    <p className="text-sm text-gray-600 mt-1 leading-relaxed">{n.message}</p>
                                    <div className="flex items-center gap-2 mt-3">
                                        <span className="text-[10px] font-medium bg-gray-100 text-gray-500 px-2 py-1 rounded-md">
                                            {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                                        </span>
                                        <span className="text-[10px] font-bold text-gray-400 uppercase">• {n.type}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div className="flex flex-col items-center justify-center h-full py-12 text-gray-400">
                            <Bell size={48} className="mb-4 opacity-20" />
                            <p className="text-sm font-medium">No notifications found</p>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
