import { Calendar, Plus } from 'lucide-react';

export default function UpcomingEvents({ events = [], onAdd }) {
  const getTypeColor = (type) => {
    switch (type) {
      case 'promotion': return 'bg-purple-100 text-purple-600';
      case 'maintenance': return 'bg-red-100 text-red-600';
      case 'holiday': return 'bg-blue-100 text-blue-600';
      default: return 'bg-orange-100 text-orange-600';
    }
  };

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300">

      <div className="flex justify-between items-center mb-6">
        <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
          <Calendar size={18} className="text-orange-500" />
          Upcoming Events
        </h3>
        <button
          onClick={onAdd}
          className="p-1.5 hover:bg-gray-100 rounded-full text-gray-500 hover:text-black transition-all"
        >
          <Plus size={18} />
        </button>
      </div>

      <div className="space-y-4">
        {events.length > 0 ? events.map((e, i) => (
          <div key={e._id || i} className="flex justify-between items-center group">
            <div className="flex gap-4 items-center min-w-0">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 ${getTypeColor(e.type)}`}>
                <Calendar size={20} />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-sm text-gray-900 truncate">
                  {e.title}
                </p>
                <p className="text-[10px] font-medium text-gray-400 mt-0.5">
                  {new Date(e.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} • {e.time || 'All Day'}
                </p>
              </div>
            </div>

            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
              {e.type}
            </span>
          </div>
        )) : (
          <div className="flex flex-col items-center justify-center py-10 opacity-40">
            <Calendar size={40} className="mb-2 text-gray-300" />
            <p className="text-xs font-medium text-gray-400">No events scheduled</p>
          </div>
        )}
      </div>
    </div>
  );
}
