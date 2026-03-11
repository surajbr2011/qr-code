import React, { useState } from "react";
import { Check, Clock, ChevronDown, ChevronUp } from "lucide-react";

export default function OrderCard({ title, items, status, highlight }) {
  const isPending = status === "pending";

  return (
    <div
      className={`
        flex items-center justify-between bg-white
        border rounded-2xl px-5 py-4
        transition-all duration-300 ease-out
        hover:shadow-lg hover:-translate-y-0.5
        ${highlight
          ? "border-blue-500 ring-4 ring-blue-500/10 shadow-md z-10"
          : "border-gray-100 shadow-sm"
        }
      `}
    >
      {/* LEFT */}
      <div className="flex items-center gap-4 flex-1 min-w-0">
        {/* STATUS ICON */}
        <div className="w-14 h-10 flex items-center justify-center rounded-lg bg-[#edb985f4] shrink-0">
          <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
            {isPending ? (
              <Clock size={14} className="text-[#DC2626]" strokeWidth={2.5} />
            ) : (
              <Check size={14} className="text-[#16A34A]" strokeWidth={2.5} />
            )}
          </div>
        </div>

        {/* TEXT */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 mb-0.5">
            {title}
          </p>
          <OrderItemsDisplay items={items} />
        </div>
      </div>

      {/* STATUS BADGE */}
      <span
        className={`text-[10px] font-bold px-3 py-1 rounded-full whitespace-nowrap uppercase tracking-wider ml-4
          ${isPending
            ? "bg-red-50 text-[#DC2626]"
            : "bg-green-50 text-[#16A34A]"
          }
        `}
      >
        {isPending ? "Pending" : (["delivered", "completed", "done"].includes((status || "").toLowerCase()) ? "Delivered" : (status ? status.charAt(0).toUpperCase() + status.slice(1) : "Confirmed"))}
      </span>
    </div>
  );
}

function OrderItemsDisplay({ items }) {
  const [expanded, setExpanded] = useState(false);

  // Normalize items
  let normalizedItems = [];
  if (Array.isArray(items)) {
    normalizedItems = items.map(it => (typeof it === 'string' ? { name: it, qty: 1 } : it));
  } else if (typeof items === 'string') {
    // Check if it's the "₹500 (3 items)" format from Dashboard.jsx
    if (items.includes('items)') && items.includes('(')) {
      return <p className="text-xs text-gray-500 font-medium">{items}</p>;
    }
    normalizedItems = items.split(', ').map(name => ({ name, qty: 1 }));
  }

  const displayItems = expanded ? normalizedItems : normalizedItems.slice(0, 2);
  const hasMore = normalizedItems.length > 2;

  if (normalizedItems.length === 0) return null;

  return (
    <div className="w-full">
      <ul className="text-[11px] text-gray-500 space-y-0.5">
        {displayItems.map((it, idx) => (
          <li key={idx} className="flex items-center gap-1.5">
            <span className="w-1 h-1 rounded-full bg-gray-300 shrink-0" />
            <span className="truncate font-medium">{it.name || it}</span>
            {it.qty > 0 && <span className="text-gray-400 shrink-0">x{it.qty}</span>}
          </li>
        ))}
      </ul>

      {hasMore && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setExpanded(!expanded);
          }}
          className="mt-1 flex items-center gap-1 text-[10px] text-blue-500 font-bold hover:underline"
        >
          {expanded ? "Show Less" : `+${normalizedItems.length - 2} more`}
          {expanded ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
        </button>
      )}
    </div>
  );
}
