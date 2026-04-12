import { useState } from 'react';
import { Bell, Info, Package, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';

export default function NotificationCard({ title, notifications = [], onNotificationClick }) {
  const [expanded, setExpanded] = useState(false);

  const getIcon = (type) => {
    switch (type) {
      case 'order': return <Package className="text-blue-500" size={16} />;
      case 'alert': return <AlertCircle className="text-red-500" size={16} />;
      default: return <Bell className="text-orange-500" size={16} />;
    }
  };

  const displayedNotifications = expanded ? notifications : notifications.slice(0, 4);

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300">
      <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
        {getIcon('default')}
        {title}
      </h3>

      <div className="space-y-4">
        {displayedNotifications.length > 0 ? displayedNotifications.map((n, i) => (
          <div
            key={n._id || i}
            onClick={() => onNotificationClick && onNotificationClick(n)}
            className="flex gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100 cursor-pointer"
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 
              ${n.type === 'order' ? 'bg-blue-50' : 'bg-orange-50'}`}>
              {getIcon(n.type)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start">
                <p className="font-bold text-gray-900 text-sm truncate">{n.title}</p>
                <span className="text-[10px] text-gray-400 font-medium ml-2 shrink-0">
                  {n.createdAt && new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p className="text-xs text-gray-500 line-clamp-2 mt-0.5 leading-relaxed">
                {n.message}
              </p>
            </div>
          </div>
        )) : (
          <div className="flex flex-col items-center justify-center py-8 opacity-40">
            <Bell size={32} className="mb-2 text-gray-300" />
            <p className="text-xs font-medium text-gray-400">No new notifications</p>
          </div>
        )}

        {notifications.length > 4 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full mt-2 py-2 flex items-center justify-center gap-2 text-xs font-bold text-gray-400 hover:text-black hover:bg-gray-50 rounded-xl transition-all group"
          >
            {expanded ? "Show Less" : `View ${notifications.length - 4} More Alerts`}
            {expanded ? (
              <ChevronUp size={14} className="group-hover:-translate-y-0.5 transition-transform" />
            ) : (
              <ChevronDown size={14} className="group-hover:translate-y-0.5 transition-transform" />
            )}
          </button>
        )}
      </div>
    </div>
  );
}
