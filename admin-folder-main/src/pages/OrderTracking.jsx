import { useState, useEffect, Fragment } from "react";
import PageWrapper from "../components/layout/PageWrapper";
import { Icon } from "@iconify/react";
import api from "../utils/api";
import socket from "../utils/socket";

const TABS = ["All", "Pending", "Confirmed", "Preparing", "Delivered"];

export default function OrderTracking() {
  const [activeTab, setActiveTab] = useState("All");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    fetchOrders();

    socket.on("order:new", (newOrder) => {
      setOrders(prev => [newOrder, ...prev]);
    });

    socket.on("order:update", (updatedOrder) => {
      setOrders(prev => prev.map(o => o._id === updatedOrder._id ? updatedOrder : o));
    });

    return () => {
      socket.off("order:new");
      socket.off("order:update");
    };
  }, []);

  const fetchOrders = async () => {
    try {
      const { data } = await api.get('/orders');
      setOrders(data);
    } catch (err) {
      console.error("Failed to fetch orders", err);
    } finally {
      setLoading(false);
    }
  };

  const getStage = (status) => {
    if (!status || ['pending'].includes(status.toLowerCase())) return "Pending";
    if (['confirm', 'confirmed'].includes(status?.toLowerCase())) return "Confirmed";
    if (['preparing'].includes(status?.toLowerCase())) return "Preparing";
    if (['delivered', 'served'].includes(status?.toLowerCase())) return "Delivered";
    return status;
  };

  const filteredOrders = orders.filter((o) => {
    const stageMatch = activeTab === "All" || getStage(o.status) === activeTab;
    const orderDate = new Date(o.createdAt);

    let dateMatch = true;
    if (startDate) {
      dateMatch = dateMatch && orderDate >= new Date(startDate);
    }
    if (endDate) {
      // Set end date to end of day
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      dateMatch = dateMatch && orderDate <= end;
    }

    return stageMatch && dateMatch;
  });

  return (
    <PageWrapper>
      <div className="animate-page px-3 sm:px-6 space-y-6">

        {/* ================= TITLE & DATE FILTER ================= */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h1 className="text-xl sm:text-2xl font-bold text-black">
            Order Tracking
          </h1>

          <div className="flex flex-wrap gap-3 items-center">
            {/* Start Date */}
            <div
              className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 shadow-sm relative group hover:border-black transition-all cursor-pointer"
              onClick={() => document.getElementById('startDatePicker').showPicker()}
            >
              <Icon icon="mdi:calendar" width={16} className="text-gray-400 group-hover:text-black transition-colors" />
              <span className="text-[10px] font-bold text-gray-400 uppercase">From</span>
              <input
                id="startDatePicker"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="text-xs font-bold outline-none bg-transparent cursor-pointer w-24 sm:w-auto"
              />
            </div>

            {/* End Date */}
            <div
              className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 shadow-sm relative group hover:border-black transition-all cursor-pointer"
              onClick={() => document.getElementById('endDatePicker').showPicker()}
            >
              <Icon icon="mdi:calendar" width={16} className="text-gray-400 group-hover:text-black transition-colors" />
              <span className="text-[10px] font-bold text-gray-400 uppercase">To</span>
              <input
                id="endDatePicker"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="text-xs font-bold outline-none bg-transparent cursor-pointer w-24 sm:w-auto"
              />
            </div>

            {(startDate || endDate) && (
              <button
                onClick={() => { setStartDate(""); setEndDate(""); }}
                className="p-2 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition-colors shadow-sm"
                title="Clear Filters"
              >
                <Icon icon="mdi:filter-off" width={16} />
              </button>
            )}
          </div>
        </div>

        {/* ================= FILTER TABS ================= */}
        <div className="flex gap-3 flex-wrap">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${activeTab === tab
                ? "bg-black text-white shadow-md transform scale-105"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:text-black"
                }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* ================= TABLE CARD ================= */}
        <div className="bg-white border border-gray-100 rounded-3xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-sm">
              <thead className="bg-gray-50/50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Order Id
                  </th>
                  <th className="text-left px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="text-left px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Items
                  </th>
                  <th className="text-left px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Payment Mode
                  </th>
                  <th className="text-left px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5" className="text-center py-10 text-gray-400">Loading orders...</td>
                  </tr>
                ) : (
                  Object.entries(
                    filteredOrders
                      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                      .reduce((groups, order) => {
                        const date = new Date(order.createdAt).toLocaleDateString(undefined, {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        });
                        if (!groups[date]) groups[date] = [];
                        groups[date].push(order);
                        return groups;
                      }, {})
                  ).map(([date, groupOrders]) => (
                    <Fragment key={date}>
                      {/* DATE HEADER */}
                      <tr className="bg-gray-50 border-y border-gray-100">
                        <td colSpan="5" className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">
                          {date}
                        </td>
                      </tr>

                      {/* ITEMS FOR THIS DATE */}
                      {groupOrders.map((order, i) => (
                        <tr
                          key={order._id || i}
                          className="border-b last:border-none hover:bg-gray-50 transition"
                        >
                          <td className="px-6 py-4 text-blue-600 font-medium cursor-pointer">
                            #{order._id?.slice(-8).toUpperCase() || "N/A"}
                          </td>

                          <td className="px-6 py-4">
                            <p className="font-medium text-gray-900">
                              {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </td>

                          <td className="px-6 py-4 max-w-xs">
                            <OrderItemsDisplay items={order.items} />
                          </td>

                          <td className="px-6 py-4">
                            <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-bold uppercase">
                              {order.paymentMode || order.paymentStatus || "Online"}
                            </span>
                          </td>

                          <td className="px-6 py-4">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap shadow-sm border ${getStage(order.status) === "Confirmed"
                                ? "bg-purple-50 text-purple-700 border-purple-100"
                                : getStage(order.status) === "Preparing"
                                  ? "bg-yellow-50 text-yellow-700 border-yellow-100"
                                  : "bg-green-50 text-green-700 border-green-100"
                                }`}
                            >
                              {order.status?.toUpperCase() || "PENDING"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </Fragment>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {filteredOrders.length === 0 && (
            <div className="text-center py-10 text-gray-500">
              No orders found
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  );
}

function OrderItemsDisplay({ items, align = "left" }) {
  const [expanded, setExpanded] = useState(false);

  // Robust normalization
  const normalizedItems = Array.isArray(items)
    ? items.map(it => (typeof it === 'string' ? { name: it, qty: 1 } : it))
    : [];

  const displayItems = expanded ? normalizedItems : normalizedItems.slice(0, 2);
  const hasMore = normalizedItems.length > 2;

  return (
    <div className={`w-full flex flex-col ${align === "center" ? "items-center" : "items-start"}`}>
      <ul className={`text-sm text-gray-600 space-y-1 w-full ${align === "center" ? "flex flex-col items-center" : ""}`}>
        {displayItems.map((it, idx) => (
          <li key={idx} className="flex items-center gap-1.5 max-w-full">
            <span className="w-1 h-1 rounded-full bg-gray-300 shrink-0" />
            <span className="truncate font-medium">{it.name || it}</span>
            <span className="text-gray-400 text-xs shrink-0">x{it.qty || it.quantity || 1}</span>
          </li>
        ))}
      </ul>

      {hasMore && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setExpanded(!expanded);
          }}
          className="mt-2 text-[11px] font-bold text-blue-500 hover:text-blue-700 flex items-center gap-1 transition-colors"
        >
          {expanded ? "Show Less" : `+${normalizedItems.length - 2} more items`}
          <Icon
            icon={expanded ? "mdi:chevron-up" : "mdi:chevron-down"}
            width={16}
          />
        </button>
      )}
    </div>
  );
}
