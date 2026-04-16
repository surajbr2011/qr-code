import { useState, useEffect } from "react";
import PageWrapper from "../components/layout/PageWrapper";
import { Icon } from "@iconify/react";
import api from "../utils/api";
import socket from "../utils/socket";
import toast from "react-hot-toast";

/* ================= COMPONENT ================= */

const FILTERS = ["Confirmed", "Preparing", "Delivered"];

export default function OrderManagement() {
  const [tableFilter, setTableFilter] = useState("Confirmed");
  const [roomFilter, setRoomFilter] = useState("Confirmed");

  const [newOrders, setNewOrders] = useState([]);
  const [tableOrders, setTableOrders] = useState([]);
  const [roomOrders, setRoomOrders] = useState([]);

  // Expansion levels (2 rows of 2 = 4 items)
  const [expandedNew, setExpandedNew] = useState(false);
  const [expandedTable, setExpandedTable] = useState(false);
  const [expandedRoom, setExpandedRoom] = useState(false);

  useEffect(() => {
    fetchOrders();

    socket.on("order:new", (newOrder) => {
      console.log("🔔 Admin Socket: New Order Received!", newOrder);
      fetchOrders();

      // Distinct Admin Sound (Doorbell)
      const audio = new Audio("/sounds/notification.mp3");
      audio.volume = 1.0;
      audio.play().then(() => console.log("Sound played"))
        .catch(e => console.warn("Sound blocked. User interaction required:", e));

      toast.success(`New Order: Table ${newOrder.tableNo || "?"}`, {
        duration: 5000,
        position: "top-right",
        style: {
          border: '1px solid #713200',
          padding: '16px',
          color: '#713200',
        },
      });
    });

    socket.on("order:update", (updatedOrder) => {
      console.log("🔔 Admin Socket: Order Updated!", updatedOrder);
      fetchOrders();
    });

    const interval = setInterval(fetchOrders, 30000); // Increased to 30s since we have sockets
    return () => {
      clearInterval(interval);
      socket.off("order:new");
      socket.off("order:update");
    };
  }, []);

  const fetchOrders = async () => {
    try {
      const { data } = await api.get("/orders");

      const pending = [];
      const table = [];
      const room = [];

      data.forEach(o => {
        if (o.status === 'pending') {
          pending.push(o);
        } else {
          const tn = (o.tableNo || "").toLowerCase();
          const isRoom = tn.includes("room") || tn.startsWith("r-") || tn.startsWith("r ");
          if (isRoom) {
            room.push(o);
          } else {
            table.push(o);
          }
        }
      });

      setNewOrders(pending.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      setTableOrders(table.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      setRoomOrders(room.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));

    } catch (err) {
      console.error(err);
    }
  };

  const updateStatus = async (id, currentStatus) => {
    let nextStatus = 'confirm';
    if (currentStatus === 'pending') nextStatus = 'confirm';
    else if (currentStatus === 'confirm') nextStatus = 'preparing';
    else if (currentStatus === 'preparing') nextStatus = 'delivered';
    else if (currentStatus === 'delivered') nextStatus = 'completed'; // or remove
    else return;

    try {
      await api.put(`/orders/${id}/status`, { status: nextStatus });
      toast.success(`Order marked as ${nextStatus}`);
      fetchOrders();
    } catch (err) {
      toast.error("Status update failed");
    }
  };

  const confirmOrder = (id) => updateStatus(id, 'pending');

  const filteredTableOrders = tableOrders.filter((o) =>
    tableFilter === 'All' ? true : o.status === tableFilter.toLowerCase().replace('confirmed', 'confirm')
  );

  const filteredRoomOrders = roomOrders.filter((o) =>
    roomFilter === 'All' ? true : o.status === roomFilter.toLowerCase().replace('confirmed', 'confirm')
  );

  return (
    <PageWrapper>
      <div className="animate-page px-6 pt-3 pb-8 bg-white min-h-screen space-y-10">

        {/* ================= TITLE ================= */}
        <h1 className="text-2xl font-bold">Order Management</h1>

        {/* ================= NEW ORDERS ================= */}
        {newOrders.length > 0 && (
          <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-lg">
            <h2 className="text-red-500 font-bold mb-4 flex items-center gap-2">
              <Icon icon="mdi:bell-ring" className="animate-bounce" /> New Orders ({newOrders.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(expandedNew ? newOrders : newOrders.slice(0, 4)).map((order, i) => (
                <div
                  key={order._id}
                  className="bg-white border border-gray-100 rounded-3xl p-6
                           shadow-sm hover:shadow-xl transition-all duration-300 group"
                >
                  <div className="flex gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                      <Icon
                        icon="mdi:bell-ring"
                        width={28}
                        className="text-red-500"
                      />
                    </div>

                    <div>
                      <p className="font-bold text-gray-900">{order.tableNo || "Unknown Table"}</p>
                      <OrderItemsDisplay items={order.items} align="left" />
                    </div>
                  </div>

                  <button onClick={() => confirmOrder(order._id)} className="mt-6 w-full bg-black hover:bg-gray-800
                                   text-white py-3 rounded-xl text-sm font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
                    Confirm Order
                  </button>
                </div>
              ))}
            </div>

            {newOrders.length > 4 && (
              <div className="flex justify-center mt-6">
                <button
                  onClick={() => setExpandedNew(!expandedNew)}
                  className="p-2 rounded-full border border-gray-100 hover:bg-gray-50 transition-colors shadow-sm"
                  title={expandedNew ? "Show Less" : "Show More"}
                >
                  <Icon
                    icon={expandedNew ? "mdi:chevron-up" : "mdi:chevron-down"}
                    width={24}
                    className="text-gray-600"
                  />
                </button>
              </div>
            )}
          </div>
        )}

        {/* ================= TABLE & ROOM ORDERS ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_40px_1fr] gap-10">

          {/* ================= TABLE ORDERS ================= */}
          <div>
            <SectionHeader
              title="Table Orders"
              active={tableFilter}
              onChange={setTableFilter}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {(expandedTable ? filteredTableOrders : filteredTableOrders.slice(0, 4)).map((o, i) => (
                <OrderCard
                  key={o._id}
                  order={o}
                  onStatusClick={() => updateStatus(o._id, o.status)}
                />
              ))}
              {filteredTableOrders.length === 0 && <p className="text-center text-gray-400 col-span-2 py-4">No {tableFilter} orders</p>}
            </div>

            {filteredTableOrders.length > 4 && (
              <div className="flex justify-center mt-6">
                <button
                  onClick={() => setExpandedTable(!expandedTable)}
                  className="p-2 rounded-full border border-gray-100 hover:bg-gray-50 transition-colors shadow-sm"
                >
                  <Icon
                    icon={expandedTable ? "mdi:chevron-up" : "mdi:chevron-down"}
                    width={24}
                    className="text-gray-600"
                  />
                </button>
              </div>
            )}
          </div>

          {/* DIVIDER */}
          <div className="hidden lg:flex justify-center">
            <div className="border-l border-dashed h-full" />
          </div>

          {/* ================= ROOM ORDERS ================= */}
          <div>
            <SectionHeader
              title="Room Orders"
              active={roomFilter}
              onChange={setRoomFilter}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {(expandedRoom ? filteredRoomOrders : filteredRoomOrders.slice(0, 4)).map((o, i) => (
                <OrderCard
                  key={o._id}
                  order={o}
                  onStatusClick={() => updateStatus(o._id, o.status)}
                />
              ))}
              {filteredRoomOrders.length === 0 && <p className="text-center text-gray-400 col-span-2 py-4">No {roomFilter} orders</p>}
            </div>

            {filteredRoomOrders.length > 4 && (
              <div className="flex justify-center mt-6">
                <button
                  onClick={() => setExpandedRoom(!expandedRoom)}
                  className="p-2 rounded-full border border-gray-100 hover:bg-gray-50 transition-colors shadow-sm"
                >
                  <Icon
                    icon={expandedRoom ? "mdi:chevron-up" : "mdi:chevron-down"}
                    width={24}
                    className="text-gray-600"
                  />
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </PageWrapper>
  );
}

/* ================= REUSABLE COMPONENTS ================= */

function SectionHeader({ title, active, onChange }) {
  return (
    <div className="flex flex-col items-center mb-8">
      <span className="px-6 py-2 border border-gray-100 bg-white shadow-sm rounded-full font-bold text-gray-900 mb-6">
        {title}
      </span>

      <div className="flex flex-wrap justify-center gap-2 p-1.5 bg-gray-100/50 rounded-2xl sm:rounded-full">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => onChange(f)}
            className={`px-4 sm:px-6 py-2 rounded-full text-xs sm:text-sm font-bold transition-all duration-300
              ${active === f
                ? "bg-black text-white shadow-lg transform scale-105"
                : "text-gray-500 hover:text-black hover:bg-white/50"
              }`}
          >
            {f}
          </button>
        ))}
      </div>
    </div>
  );
}

function OrderCard({ order, onStatusClick }) {
  const statusToColor = (status) => {
    if (status === "confirm") return "red";
    if (status === "preparing") return "yellow";
    if (status === "delivered") return "green";
    return "red";
  };

  const statusLabel = (status) => {
    if (status === 'confirm') return 'Confirmed';
    if (status === 'preparing') return 'Preparing';
    if (status === 'delivered') return 'Delivered';
    return status;
  }

  const color = statusToColor(order.status);
  const title = order.tableNo || "Unknown Table";

  return (
    <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between text-center group relative">
      {/* TOP CONTENT */}
      < div >
        {/* ICON */}
        < div
          className={`w-14 h-14 mx-auto rounded-2xl mb-4 flex items-center justify-center transition-transform duration-300 group-hover:scale-110
            ${color === "green"
              ? "bg-green-50"
              : color === "yellow"
                ? "bg-yellow-50"
                : "bg-red-50"
            }`
          }
        >
          <Icon
            icon={
              color === "green"
                ? "mdi:check-circle-outline"
                : color === "yellow"
                  ? "mdi:chef-hat"
                  : "mdi:bell-ring"
            }
            width={32}
            className={
              color === "green"
                ? "text-green-600"
                : color === "yellow"
                  ? "text-yellow-600"
                  : "text-red-500"
            }
          />
        </div >

        {/* TITLE */}
        < p className="font-bold text-lg text-gray-900" > {title}</p >

        {/* ITEMS */}
        < div className="mt-3" >
          <OrderItemsDisplay items={order.items} align="center" />
        </div >

        {/* USER + TIME */}
        < div className="flex justify-center gap-4 text-xs font-semibold text-gray-400 mt-3 uppercase tracking-wide" >
          <span>{order.customerName || "Guest"}</span>
          <span>•</span>
          <span>{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div >
      </div >

      {/* STATUS BUTTON (BOTTOM FIXED) */}
      < button
        onClick={onStatusClick}
        className={`w-full py-3 rounded-2xl text-sm font-bold cursor-pointer shadow-md hover:shadow-lg border-b-4 active:border-b-0 active:translate-y-1 transition-all
          ${color === "green"
            ? "bg-green-500 border-green-700 text-white hover:bg-green-600"
            : color === "yellow"
              ? "bg-yellow-400 border-yellow-600 text-yellow-900 hover:bg-yellow-500"
              : "bg-red-500 border-red-700 text-white hover:bg-red-600"
          }`}
      >
        {statusLabel(order.status)}
      </button >

      {/* Offer Indicator */}
      {
        (order.offerApplied || order.promoCode) && (
          <div className="absolute top-4 right-4 bg-green-100 text-green-700 px-2 py-1 rounded-lg text-[10px] font-bold border border-green-200 shadow-sm flex items-center gap-1">
            <Icon icon="mdi:tag" />
            {order.offerApplied?.title || order.promoCode}
            {order.offerApplied?.discount ? ` (${order.offerApplied.discount}%)` : ''}
          </div>
        )
      }
    </div >
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
