export default function StatCard({ title, value, sub }) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ease-in-out cursor-default">
      {/* TITLE – BLACK & BOLD */}
      <p className="text-sm font-bold text-[var(--text-dark)]">
        {title}
      </p>

      {/* VALUE */}
      <p className="text-xl font-semibold mt-1">
        {value}
      </p>

      {/* SUBTEXT */}
      {sub && (
        <p className="text-xs text-[var(--text-gray)] mt-1">
          {sub}
        </p>
      )}
    </div>
  );
}
