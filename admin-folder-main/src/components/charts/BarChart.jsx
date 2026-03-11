import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// Data passed via props
export default function BarChart({ data = [] }) {
  const chartData = data.length > 0 ? data : [
    { name: "M", value: 0 },
    { name: "T", value: 0 },
    { name: "W", value: 0 },
    { name: "T", value: 0 },
    { name: "F", value: 0 },
    { name: "S", value: 0 },
  ];
  return (
    <div className="bg-white border border-[var(--border-light)] rounded-3xl p-6 hover:shadow-lg transition-shadow duration-300">

      {/* TITLE */}
      <h3 className="text-base font-bold text-gray-900 mb-6">
        Expense Tracking
      </h3>

      <div className="h-48 w-full min-h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsBarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#9CA3AF', fontSize: 10, fontWeight: 500 }}
              dy={10}
            />
            <Tooltip
              cursor={{ fill: '#F3F4F6', radius: 8 }}
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
            />
            <Bar
              dataKey="value"
              fill="#2563EB"
              radius={[6, 6, 0, 0]}
              animationDuration={1500}
              animationEasing="ease-out"
              barSize={24}
            />
          </RechartsBarChart>
        </ResponsiveContainer>
      </div>

      <p className="text-xs text-center text-gray-400 mt-4 font-medium">
        This week
      </p>
    </div>
  );
}
