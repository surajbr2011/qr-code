export default function TableCard({ label, status = "free", active }) {
  return (
    <div
      className={`bg-white border rounded-xl overflow-hidden cursor-pointer transition
        ${active ? "border-black shadow-md" : "border-[var(--border-light)] hover:shadow-md"}
      `}
    >
      {/* Image */}
      <img
        src="https://images.unsplash.com/photo-1600891964599-f61ba0e24092"
        alt="food"
        className="w-full h-32 object-cover"
      />

      {/* Label + Status */}
      <div className="px-3 py-3 flex items-center justify-between">
        <span className="font-medium text-sm">
          {label}
        </span>

        {/* Status dot */}
        <span
          className={`w-3.5 h-3.5 rounded-full
            ${status === "occupied" ? "bg-red-500" : "bg-green-500"}
          `}
        />
      </div>
    </div>
  );
}
