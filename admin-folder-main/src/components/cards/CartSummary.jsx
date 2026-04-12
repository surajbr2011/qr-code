import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

export default function CartSummary({ data = [] }) {
  const hasData = data.some(d => d.value > 0);

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300">
      <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">
        Cart Sales Distribution
      </h3>

      <div className="h-48 w-full flex items-center justify-center relative">
        {hasData ? (
          <>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  innerRadius={60}
                  outerRadius={80}
                  dataKey="value"
                  stroke="none"
                  paddingAngle={5}
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-bold text-gray-900">100%</span>
              <span className="text-[10px] text-gray-400 font-medium">Categorized</span>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center">
            <div className="w-32 h-32 rounded-full border-4 border-dashed border-gray-100 flex items-center justify-center">
              <p className="text-gray-400 text-[10px] text-center px-4 font-medium">No sales recorded yet</p>
            </div>
          </div>
        )}
      </div>

      {hasData && (
        <div className="flex justify-center gap-6 mt-6">
          {data.map((c) => (
            <div key={c.name} className="flex flex-col items-center">
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                <span className="text-xs font-bold text-gray-900">{c.value}%</span>
              </div>
              <span className="text-[10px] text-gray-400 font-medium uppercase tracking-tighter">{c.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
