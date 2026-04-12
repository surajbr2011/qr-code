import React, { useState } from "react";
import { motion } from "framer-motion";
import { Check, ChevronDown, ChevronUp, Printer } from "lucide-react";

export default function OrderCard({ order, onClick }) {
  // Determine styles based on status
  const getStatusStyles = (status) => {
    switch (status) {
      case "delivered": // Image 1 - Green
        return {
          bg: "bg-[#6BCB77]",
          icon: <Check className="text-white" size={20} strokeWidth={3} />
        };
      case "ontheway": // Image 3 - Yellow/Orange
        return {
          bg: "bg-[#FFB72B]", // Matching the yellow/orange from image
          icon: <Check className="text-white" size={20} strokeWidth={3} />
        };
      case "ready":
        return {
          bg: "bg-blue-500",
          icon: <img src="/src/assets/images/ready_icon.png" alt="Ready" className="w-5 h-5 object-contain" />
        };
      case "preparing":
        return {
          bg: "bg-orange-500",
          icon: <Check className="text-white" size={20} strokeWidth={3} />
        };
      case "confirm": // Image 2 - Pink/Red
      default:
        return {
          bg: "bg-[#FF9B9B]", // Matching the pink/salmon from image
          icon: <Check className="text-white" size={20} strokeWidth={3} />
        };
    }
  };

  const styles = getStatusStyles(order.status);

  const handlePrintKOT = (e) => {
    e.stopPropagation();
    const printWindow = window.open('', '', 'height=600,width=400');
    printWindow.document.write('<html><head><title>KOT</title>');
    printWindow.document.write('<style>');
    printWindow.document.write('@media print { @page { size: 58mm auto; margin: 0; } }');
    printWindow.document.write('body { width: 58mm !important; margin: 0 !important; padding: 2px 4px !important; font-family: monospace; font-size: 10px; font-weight: bold; overflow: hidden; }');
    printWindow.document.write('* { box-sizing: border-box; }');
    printWindow.document.write('.header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 5px; margin-bottom: 5px; }');
    printWindow.document.write('.title { font-size: 14px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; }');
    printWindow.document.write('.meta { font-size: 10px; margin-top: 2px; }');
    printWindow.document.write('.dashed-line { border-bottom: 1px dashed #000; margin: 5px 0; }');
    printWindow.document.write('.item-table { width: 100%; border-collapse: collapse; text-align: left; }');
    printWindow.document.write('.item-table th { border-bottom: 1px solid #000; padding: 2px 0; font-size: 10px; text-transform: uppercase; }');
    printWindow.document.write('.item-table td { padding: 4px 0; font-size: 11px; font-weight: bold; }');
    printWindow.document.write('.text-right { text-align: right; }');
    printWindow.document.write('.footer { border-top: 1px dashed #000; margin-top: 10px; padding-top: 10px; text-align: center; font-style: italic; font-weight: bold; }');
    printWindow.document.write('</style>');
    printWindow.document.write('</head><body>');

    // Header
    printWindow.document.write('<div class="header">');
    printWindow.document.write('<div class="title">CINNAMON AGONDA</div>');
    printWindow.document.write('<div class="title" style="font-size:12px; margin-top:2px;">KOT - ORDER</div>');
    printWindow.document.write(`<div class="meta">Table: ${order.tableNo || 'N/A'}</div>`);
    printWindow.document.write(`<div class="meta">#${order.id.toString().slice(-4)} • ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>`);
    printWindow.document.write('</div>');

    // Items
    printWindow.document.write('<table class="item-table">');
    printWindow.document.write('<thead><tr><th>ITEM</th><th class="text-right">QTY</th></tr></thead>');
    printWindow.document.write('<tbody>');
    order.items.forEach(item => {
      const name = typeof item === 'string' ? item : item.name;
      const qty = typeof item === 'string' ? 1 : (item.qty || item.quantity || 1);
      printWindow.document.write(`<tr><td>${name}</td><td class="text-right">${qty}</td></tr>`);
    });
    printWindow.document.write('</tbody></table>');

    // Footer
    if (order.guestInfo?.name) {
      printWindow.document.write(`<div style="margin-top:5px; font-size:10px; border-top:1px dotted #ccc; padding-top:2px;">Guest: ${order.guestInfo.name}</div>`);
    }

    printWindow.document.write('<div class="footer">');
    printWindow.document.write('Chef Verification Needed');
    printWindow.document.write('</div>');

    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, boxShadow: "0 10px 20px -5px rgba(0, 0, 0, 0.1)" }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="bg-white rounded-[20px] p-4 shadow-sm border border-gray-100 flex gap-4 cursor-pointer active:scale-[0.99] transition-transform relative group"
    >
      {/* Status Icon */}
      <div className={`w-[52px] h-[52px] ${styles.bg} rounded-[14px] flex items-center justify-center flex-shrink-0 shadow-sm`}>
        <div className="w-8 h-8 rounded-full border-2 border-white/90 flex items-center justify-center">
          {styles.icon}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <h3 className="font-bold text-[15px] text-black mb-1 leading-tight flex items-center gap-2">
          {order.tableNo || "Unassigned"}
        </h3>
        <OrderItemsDisplay items={order.items} />
      </div>

      {/* Meta Info & Print Action */}
      <div className="flex flex-col justify-between items-end min-w-[50px] pb-1 space-y-2">
        <button
          onClick={handlePrintKOT}
          className="p-2 bg-gray-100 hover:bg-black hover:text-white rounded-full transition-colors text-gray-600"
          title="Print KOT"
        >
          <Printer size={14} />
        </button>

        <div className="text-right">
          <span className="mb-0.5 text-gray-800 text-[10px] block">{order.staff}</span>
          <span className="text-gray-400 text-[10px] block">{order.time}</span>
        </div>
      </div>
    </motion.div>
  );
}

function OrderItemsDisplay({ items }) {
  const [expanded, setExpanded] = useState(false);

  // Normalize items to ensure they are objects with name and qty
  const normalizedItems = Array.isArray(items)
    ? items.map(item => (typeof item === 'string' ? { name: item, qty: 1 } : item))
    : [];

  const displayItems = expanded ? normalizedItems : normalizedItems.slice(0, 2);
  const hasMore = normalizedItems.length > 2;

  return (
    <div className="w-full flex flex-col items-start" onClick={(e) => e.stopPropagation()}>
      <ul className="text-[11px] text-[#4A4A4A] leading-snug w-full space-y-0.5">
        {displayItems.map((it, idx) => (
          <li key={idx} className="flex items-center gap-1.5 max-w-full">
            <span className="w-1 h-1 rounded-full bg-gray-300 shrink-0" />
            <span className="truncate font-medium">{it.name || it}</span>
            <span className="text-gray-400 text-[10px] shrink-0">x{it.qty || it.quantity || 1}</span>
          </li>
        ))}
      </ul>

      {hasMore && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setExpanded(!expanded);
          }}
          className="mt-1 flex items-center gap-1 text-[10px] text-blue-500 font-bold hover:underline transition-all"
        >
          {expanded ? "Show Less" : `+${normalizedItems.length - 2} more items`}
          {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>
      )}
    </div>
  );
}
