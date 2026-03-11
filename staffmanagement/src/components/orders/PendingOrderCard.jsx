import React, { useState } from "react";
import { motion } from "framer-motion";
import { Check, ChevronDown, ChevronUp } from "lucide-react";

export default function PendingOrderCard({ order, onConfirm }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4, boxShadow: "0 8px 16px -4px rgba(0, 0, 0, 0.08)" }}
            className="bg-white/50 rounded-xl p-4 mb-4 last:mb-0 border border-gray-100"
        >
            {/* Header: Icon + Room Name */}
            <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-[#FF9B9B] flex items-center justify-center flex-shrink-0">
                    <div className="w-5 h-5 rounded-full border-[1.5px] border-white flex items-center justify-center">
                        <Check className="text-white" size={12} strokeWidth={3} />
                    </div>
                </div>
                <h3 className="text-lg font-bold text-gray-900">
                    {order.tableNo || "Unassigned"}
                </h3>
            </div>

            {/* Items List */}
            <div className="mb-4 pl-1">
                <div className="space-y-1">
                    <OrderItemsDisplay items={order.items} />
                </div>
            </div>

            {/* Action Button */}
            {/* Action Button */}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    // Print KOT (58mm Format - Matched to Admin App)
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

                    // Confirm Order
                    onConfirm(order);
                }}
                className="w-full bg-[#FF9B9B] hover:bg-[#ff8585] text-black font-semibold py-3.5 rounded-xl transition-colors text-sm shadow-sm"
            >
                Confirm Order & Print KOT
            </button>
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
            <ul className="text-[13px] font-semibold text-gray-800 w-full space-y-0.5">
                {displayItems.map((it, idx) => (
                    <li key={idx} className="flex items-center gap-1.5 max-w-full">
                        <span className="w-1 h-1 rounded-full bg-gray-400 shrink-0" />
                        <span className="truncate">{it.name || it}</span>
                        <span className="text-gray-400 text-[11px] font-normal shrink-0">x{it.qty || it.quantity || 1}</span>
                    </li>
                ))}
            </ul>

            {hasMore && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        setExpanded(!expanded);
                    }}
                    className="mt-1 flex items-center gap-1 text-[11px] text-blue-500 font-bold hover:underline transition-all"
                >
                    {expanded ? "Show Less" : `+${normalizedItems.length - 2} more items`}
                    {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                </button>
            )}
        </div>
    );
}
