import { useEffect, useRef, useState } from "react";
import PageWrapper from "../components/layout/PageWrapper";
import { Icon } from "@iconify/react";
import api from "../utils/api";
import toast from "react-hot-toast";

export default function QrCodeManagement() {
  const [tab, setTab] = useState("TABLE");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newId, setNewId] = useState("");

  const fetchQRCodes = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/qrcodes");
      setData(data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch QR Codes");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQRCodes();
  }, []);

  // Filter data based on tab
  const filteredData = data.filter(item => {
    // robust check against metadata first, fallback to prefixes if metadata missing
    if (tab === 'TABLE') {
      return item.metadata?.tableName?.startsWith('Table') || item.tableId.startsWith('T-');
    }
    if (tab === 'ROOM') {
      return item.metadata?.tableName?.startsWith('Room') || (!item.tableId.startsWith('T-') && !item.metadata?.tableName?.startsWith('Table'));
    }
    return true;
  });

  const handleGenerateNew = async () => {
    console.log("Generate New Clicked. ID:", newId, "Tab:", tab);
    if (!newId.trim()) {
      console.warn("New ID is empty");
      toast.error("Please enter a table or room number");
      return;
    }
    try {
      const payload = {
        tableId: newId.trim(),
        zone: tab === 'TABLE' ? 'indoor' : 'vip',
        tableName: tab === 'TABLE' ? `Table ${newId}` : `Room ${newId}`,
        capacity: 4
      };
      console.log("Sending payload:", payload);
      const res = await api.post("/qrcodes", payload);
      console.log("Response:", res.data);
      toast.success("QR Code Generated");
      setNewId("");
      fetchQRCodes();
    } catch (err) {
      console.error("Generate Error:", err);
      toast.error(err.response?.data?.message || "Failed to create");
    }
  };

  const handleRegenerate = async (id) => {
    if (!window.confirm(`Regenerate QR Code for ${id}? This will invalidate the old one.`)) return;
    try {
      await api.post(`/new-qr/regenerate/${id}`);
      toast.success("QR Code Regenerated");
      fetchQRCodes();
    } catch (err) {
      console.error("Regenerate Error:", err);
      toast.error(err.response?.data?.message || "Failed to regenerate");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this QR Code?")) return;
    try {
      // Find item by tableId to get _id
      const item = data.find(i => i.tableId === id);
      if (item) {
        await api.delete(`/qrcodes/${item._id}`);
        toast.success("Deleted");
        fetchQRCodes();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete");
    }
  };

  /* ================= TAB STYLES ================= */
  const tabBase =
    "px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 flex items-center gap-2";
  const tabActive = "bg-black text-white shadow-lg transform scale-105";
  const tabInactive =
    "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:text-black";

  // Toggle State
  const [hideQr, setHideQr] = useState(false);

  return (
    <PageWrapper>
      <div className="min-h-screen bg-white px-6 py-4">

        {/* ================= HEADER ================= */}
        <h1 className="text-2xl font-semibold mb-1">QR Code Management</h1>
        <p className="text-sm text-[var(--text-gray)] mb-6">
          Manage your QR codes for tables and rooms
        </p>

        {/* ================= TABS & CONTROLS ================= */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          {/* Tabs */}
          <div className="flex gap-3">
            <button
              onClick={() => setTab("TABLE")}
              className={`${tabBase} ${tab === "TABLE" ? tabActive : tabInactive}`}
            >
              <Icon icon="mdi:table-furniture" width={18} />
              Tables
            </button>
            <button
              onClick={() => setTab("ROOM")}
              className={`${tabBase} ${tab === "ROOM" ? tabActive : tabInactive}`}
            >
              <Icon icon="mdi:door" width={18} />
              Rooms
            </button>
          </div>

          {/* Hide QR Toggle */}
          <div className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-full border border-gray-200">
            <span className="text-sm font-medium text-gray-600">Hide Scanners</span>
            <button
              onClick={() => setHideQr(!hideQr)}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-300 focus:outline-none ${hideQr ? 'bg-black' : 'bg-gray-300'}`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-300 ${hideQr ? 'translate-x-5' : 'translate-x-0'}`}
              />
            </button>
          </div>
        </div>

        {/* ================= GENERATE NEW QR CODE SECTION ================= */}
        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Generate New QR Code
          </h2>
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              value={newId}
              onChange={(e) => setNewId(e.target.value)}
              placeholder={tab === "TABLE" ? "Enter Table ID (e.g. T-01)" : "Enter Room ID (e.g. R-101)"}
              className="
                flex-1
                px-4 py-3
                bg-white border border-gray-200
                rounded-xl text-sm
                focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10
                placeholder:text-gray-400
                transition-all duration-200
              "
              onKeyDown={(e) => e.key === "Enter" && handleGenerateNew()}
            />
            <button
              onClick={handleGenerateNew}
              className="
                px-6 py-3
                bg-blue-500 hover:bg-blue-600
                text-white
                rounded-xl
                text-sm font-bold
                shadow-sm hover:shadow-md
                transition-all duration-200
                active:scale-95
                whitespace-nowrap
              "
            >
              Generate New
            </button>
          </div>
        </div>

        {/* ================= QR CODES GRID ================= */}
        <div
          className="
            grid
            grid-cols-1
            sm:grid-cols-2
            lg:grid-cols-3
            xl:grid-cols-4
            gap-6
          "
        >
          {/* SKELETON */}
          {loading &&
            Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}

          {!loading &&
            filteredData.map((item) => (
              <QrCard
                key={item._id}
                item={item}
                type={tab}
                hideQr={hideQr}
                onRegenerate={() => handleRegenerate(item.tableId)}
                onDelete={() => handleDelete(item.tableId)}
              />
            ))}
        </div>

        {/* Empty State */}
        {!loading && filteredData.length === 0 && (
          <div className="text-center py-16">
            <Icon icon="mdi:qrcode" className="mx-auto text-gray-300 mb-4" width={64} />
            <p className="text-gray-500 text-lg">No QR codes generated yet</p>
            <p className="text-gray-400 text-sm mt-2">
              Create a new QR code for {tab === "TABLE" ? "tables" : "rooms"} using the form above
            </p>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}

/* ================= QR CARD ================= */

function QrCard({ item, type, hideQr, onRegenerate, onDelete }) {
  // Use backend provided image
  const downloadQR = () => {
    const a = document.createElement("a");
    a.href = item.qrCodeUrl;
    a.download = `${type}-${item.tableId}.png`;
    a.click();
  };

  return (
    <div
      className="
        bg-white
        rounded-2xl
        shadow-sm
        border border-gray-100
        p-5
        text-center
        transition-all duration-300
        hover:shadow-lg hover:-translate-y-1
      "
    >
      {/* Title */}
      <h3 className="font-bold text-gray-900 text-lg mb-4">
        {item.tableId}
      </h3>

      {/* QR Code */}
      {!hideQr && (
        <div
          className="
            flex justify-center items-center
            bg-white
            border-2 border-[#2563EB]/20
            rounded-xl
            p-3
            mb-4
            "
        >
          <img
            src={item.qrCodeUrl}
            alt={`QR for ${item.tableId}`}
            className="w-full h-auto max-w-[200px]"
          />
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap justify-center gap-2 mb-3">
        <button
          onClick={downloadQR}
          className="
            px-4 py-1.5
            bg-black hover:bg-gray-900
            text-white
            rounded-lg
            text-xs font-semibold
            transition-all duration-200
            active:scale-95
            disabled:opacity-50 disabled:cursor-not-allowed
          "
        >
          Download
        </button>

        <button
          onClick={onRegenerate}
          className="
            px-4 py-1.5
            bg-white hover:bg-blue-50
            text-blue-600
            border border-blue-200
            rounded-lg
            text-xs font-semibold
            transition-all duration-200
            active:scale-95
          "
        >
          Regenerate
        </button>

        <button
          onClick={onDelete}
          className="
            px-4 py-1.5
            bg-white hover:bg-red-50
            text-red-500
            border border-red-200
            rounded-lg
            text-xs font-semibold
            transition-all duration-200
            active:scale-95
          "
        >
          Delete
        </button>
      </div>

      {/* Scans Counter */}
      <p className="text-gray-400 text-sm">
        Scans: {item.scans || 0}
      </p>
    </div>
  );
}

/* ================= SKELETON ================= */

function SkeletonCard() {
  return (
    <div
      className="
        bg-white
        border border-gray-100
        rounded-2xl
        shadow-sm
        p-5
        animate-pulse
      "
    >
      <div className="h-5 bg-gray-200 rounded w-1/2 mx-auto mb-4" />
      <div className="h-36 bg-gray-200 rounded-xl mb-4" />
      <div className="flex justify-center gap-2 mb-3">
        <div className="h-7 w-20 bg-gray-200 rounded-md" />
        <div className="h-7 w-24 bg-gray-200 rounded-md" />
        <div className="h-7 w-16 bg-gray-200 rounded-md" />
      </div>
      <div className="h-4 bg-gray-200 rounded w-16 mx-auto" />
    </div>
  );
}
