import {
  AreaChart,
  Area,
  XAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// Data passed via props

export default function LineChart({ data = [] }) {
  // Use provided data or fallback to empty array (or dummy if strictly preferred to not break UI, but goal is connecting backend)
  // The user wants to replace dummy data.
  const chartData = data.length > 0 ? data : [
    { name: "Mon", value: 0 },
    { name: "Tue", value: 0 },
    { name: "Wed", value: 0 },
    { name: "Thu", value: 0 },
    { name: "Fri", value: 0 },
    { name: "Sat", value: 0 },
    { name: "Sun", value: 0 },
  ];
  return (
    <div className="bg-white border border-[var(--border-light)] rounded-3xl p-6 hover:shadow-lg transition-shadow duration-300">

      {/* TITLE */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-base font-bold text-gray-900">
          Monthly Turnover
        </h3>
        <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">
          +12.5%
        </span>
      </div>

      <div className="h-48 w-full min-h-[200px]">
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
              </linearGradient>
            </defs>
            <Tooltip
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              cursor={{ stroke: '#E5E7EB', strokeWidth: 1 }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#2563EB"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorValue)"
              animationDuration={2000}
              animationEasing="ease-out"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <p className="text-xs text-center text-gray-400 mt-4 font-medium">
        Last 7 days performance
      </p>
    </div>
  );
}
