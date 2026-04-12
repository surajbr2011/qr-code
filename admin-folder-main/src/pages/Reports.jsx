import { useState, useRef, useEffect, Fragment } from "react";
import PageWrapper from "../components/layout/PageWrapper";
import { Icon } from "@iconify/react";
import { Calendar } from "lucide-react";
import api from "../utils/api";
import { io } from "socket.io-client";
import CartSummary from "../components/cards/CartSummary";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { Download } from "lucide-react";

/* ================= MAIN ================= */

export default function Reports() {
  const [activeReport, setActiveReport] = useState("dashboard");
  const [orders, setOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter State
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Extract unique categories
  const uniqueCategories = ["All", ...new Set(menuItems.map(item => item.category).filter(Boolean))];

  const handleCategoryFilter = (cat) => {
    setSelectedCategory(cat);
  };

  // Aggregated Data States
  const [turnoverData, setTurnoverData] = useState([]);
  const [cartData, setCartData] = useState([]);
  const [kpi, setKPI] = useState({
    monthlyTurnover: 0,
    monthlyTurnoverTrend: "0%",
    thisMonthTurnover: 0,
    thisMonthTurnoverTrend: "0%",
    thisMonthOrders: 0,
    thisMonthOrdersTrend: "0%",
    totalCustomers: 0,
    totalCustomersTrend: "0%",
    thisMonthInvestment: 0,
    thisMonthInvestmentTrend: "0%",
    thisMonthProfit: 0,
    thisMonthProfitTrend: "0%",
  });

  useEffect(() => {
    fetchData();

    // Socket Connection
    const socketUrl = (import.meta.env.VITE_API_URL || "https://qr-code-1-1aya.onrender.com/api").replace("/api", "");
    const socket = io(socketUrl, {
      transports: ["websocket", "polling"],
      withCredentials: true
    });

    socket.on("connect", () => {
      console.log("Reports connected to socket:", socket.id);
    });

    // Listen for order updates
    socket.on("order:new", (newOrder) => {
      console.log("New Order Received:", newOrder);
      fetchData(); // Refresh data
    });

    socket.on("order:update", (updatedOrder) => {
      console.log("Order Updated:", updatedOrder);
      fetchData(); // Refresh data
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Update filtered orders when date range or orders change
  useEffect(() => {
    if (!orders.length) {
      setFilteredOrders([]);
      return;
    }

    if (!dateRange.from && !dateRange.to) {
      setFilteredOrders(orders);
      return;
    }

    const start = dateRange.from ? new Date(dateRange.from).setHours(0, 0, 0, 0) : 0;
    const end = dateRange.to ? new Date(dateRange.to).setHours(23, 59, 59, 999) : Infinity;

    const filtered = orders.filter(o => {
      const d = new Date(o.createdAt).getTime();
      return d >= start && d <= end;
    });

    setFilteredOrders(filtered);
  }, [orders, dateRange]);

  const fetchData = async () => {
    try {
      const [ordersRes, menuRes, expensesRes] = await Promise.all([
        api.get('/orders'),
        api.get('/menu'),
        api.get('/expenses')
      ]);
      setOrders(ordersRes.data);
      setMenuItems(menuRes.data);
      setExpenses(expensesRes.data);
      processData(ordersRes.data, menuRes.data);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch data for reports", err);
      setLoading(false);
    }
  };

  const processData = (ordersData, menuData) => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonth = prevMonthDate.getMonth();
    const prevYear = prevMonthDate.getFullYear();

    const getMonthData = (data, month, year) => data.filter(o => {
      const d = new Date(o.createdAt);
      return d.getMonth() === month && d.getFullYear() === year;
    });

    const currentOrders = getMonthData(ordersData, currentMonth, currentYear);
    const prevOrders = getMonthData(ordersData, prevMonth, prevYear);

    const calcTotal = (list) => list.reduce((acc, curr) => acc + (curr.totalAmount || 0), 0);
    const calcUniqueCust = (list) => new Set(list.map(o => o.customerName || "Guest")).size;

    const calculateTrend = (curr, prev) => {
      if (prev === 0) return curr > 0 ? "+100%" : "0%";
      const diff = ((curr - prev) / prev) * 100;
      return `${diff >= 0 ? '+' : ''}${diff.toFixed(0)}%`;
    };

    const curTurnover = calcTotal(currentOrders);
    const prevTurnover = calcTotal(prevOrders);
    const curCust = calcUniqueCust(currentOrders);
    const prevCust = calcUniqueCust(prevOrders);

    // Expenses/Investment Calculation
    const getMonthExpenses = (list, month, year) => list.filter(e => {
      const d = new Date(e.date);
      return d.getMonth() === month && d.getFullYear() === year;
    }).reduce((acc, curr) => acc + (curr.amount || 0), 0);

    const curInvestment = getMonthExpenses(expenses, currentMonth, currentYear);
    const prevInvestment = getMonthExpenses(expenses, prevMonth, prevYear);

    const curProfit = curTurnover - curInvestment;
    const prevProfit = prevTurnover - prevInvestment;

    setKPI({
      monthlyTurnover: curTurnover,
      monthlyTurnoverTrend: calculateTrend(curTurnover, prevTurnover),
      thisMonthTurnover: curTurnover,
      thisMonthTurnoverTrend: calculateTrend(curTurnover, prevTurnover),
      thisMonthOrders: currentOrders.length,
      thisMonthOrdersTrend: calculateTrend(currentOrders.length, prevOrders.length),
      totalCustomers: curCust,
      totalCustomersTrend: calculateTrend(curCust, prevCust),
      thisMonthInvestment: curInvestment,
      thisMonthInvestmentTrend: calculateTrend(curInvestment, prevInvestment),
      thisMonthProfit: curProfit,
      thisMonthProfitTrend: calculateTrend(curProfit, prevProfit),
    });

    // 2. Turnover Chart (Last 30 Days)
    const daysMap = {};
    ordersData.forEach(o => {
      const d = new Date(o.createdAt);
      // Only show last 30 days
      if (now - d < 30 * 24 * 60 * 60 * 1000) {
        const day = d.getDate();
        daysMap[day] = (daysMap[day] || 0) + (o.totalAmount || 0);
      }
    });

    const chartData = Object.keys(daysMap).map(day => ({
      day: day.toString(),
      value: daysMap[day]
    })).sort((a, b) => parseInt(a.day) - parseInt(b.day));

    setTurnoverData(chartData.length ? chartData : [{ day: now.getDate().toString(), value: 0 }]);

    // 3. Cart/Category Data
    const DRINKS_CATEGORIES = ["alcoholic beverages", "beverages (non-alcohol)", "spirits", "drinks"];
    const DRINKS_SUBCATEGORIES = ["mocktails", "cold stuff", "tea", "coffee", "juice", "shake", "smoothies", "lassi", "milk"];

    const categoryTotals = { "Veg": 0, "Non-Veg": 0, "Drinks": 0 };
    const menuLookup = {};

    menuData.forEach(item => {
      let fType = "veg";
      if (item.foodType) {
        fType = item.foodType.toLowerCase();
      } else {
        fType = item.veg ? "veg" : "nonveg";
      }

      menuLookup[item.name.toLowerCase()] = {
        category: (item.category || "").toLowerCase(),
        subCategory: (item.subCategory || "").toLowerCase(),
        foodType: fType
      };
    });

    ordersData.forEach(o => {
      o.items.forEach(it => {
        const itemName = (it.name || "").toLowerCase();
        const itemInfo = menuLookup[itemName];
        const storedType = (it.foodType || "").toLowerCase();
        const storedCat = (it.category || "").toLowerCase();
        const storedSubCat = (it.subCategory || "").toLowerCase();

        let type = "Veg"; // Default

        // 1. Check for Drinks
        const isDrinkCategory = DRINKS_CATEGORIES.includes(storedCat) || (itemInfo && DRINKS_CATEGORIES.includes(itemInfo.category));
        const isDrinkSubCategory = DRINKS_SUBCATEGORIES.includes(storedSubCat) || (itemInfo && DRINKS_SUBCATEGORIES.includes(itemInfo.subCategory));

        if (storedCat === "drinks" || isDrinkCategory || isDrinkSubCategory) {
          type = "Drinks";
        }
        // 2. Check for Non-Veg
        else if (storedType === "nonveg" || storedType === "non-veg" ||
          (itemInfo && (itemInfo.foodType === "nonveg" || itemInfo.foodType === "non-veg"))) {
          type = "Non-Veg";
        }
        // 3. Fallback / Keyword Check
        else {
          // Default is Veg, but check keywords just in case
          if (itemName.includes("non-veg") || itemName.includes("chicken") || itemName.includes("mutton") || itemName.includes("fish") || itemName.includes("prawn")) {
            type = "Non-Veg";
          } else {
            type = "Veg";
          }
        }

        categoryTotals[type] = (categoryTotals[type] || 0) + (it.quantity || 1);
      });
    });

    const totalItems = Object.values(categoryTotals).reduce((a, b) => a + b, 0);
    const colorMap = { "Veg": "#22c55e", "Non-Veg": "#ef4444", "Drinks": "#f59e0b" };

    const finalCartData = Object.entries(categoryTotals)
      .filter(([_, val]) => val > 0 || totalItems === 0)
      .map(([name, val]) => ({
        name,
        value: totalItems > 0 ? Math.round((val / totalItems) * 100) : 0,
        color: colorMap[name]
      }));

    setCartData(finalCartData);
  };

  return (
    <PageWrapper>
      <div className="space-y-8 animate-page">

        <h1 className="text-2xl font-bold">Report Management</h1>

        {/* ================= ICON TABS ================= */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 sm:gap-6">
          <ReportTab icon="mdi:receipt-text" label="Receipt" active={activeReport === "receipt"} onClick={() => setActiveReport("receipt")} />
          <ReportTab icon="mdi:chart-bar" label="Sale Summary" active={activeReport === "sale"} onClick={() => setActiveReport("sale")} />
          <ReportTab icon="mdi:finance" label="Investment Report" active={activeReport === "investment"} onClick={() => setActiveReport("investment")} />
          <ReportTab icon="mdi:cash-multiple" label="Profit Report" active={activeReport === "profit"} onClick={() => setActiveReport("profit")} />
          <ReportTab icon="mdi:calendar-clock" label="Start Close Day" active={activeReport === "day"} onClick={() => setActiveReport("day")} />
        </div>

        {/* ================= DASHBOARD ================= */}
        {activeReport === "dashboard" && (
          <>
            <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm hover:shadow-lg transition-all duration-300">
              <h2 className="font-bold text-lg mb-6">Monthly Turnover</h2>
              <div className="h-64 min-h-[240px]">
                <ResponsiveContainer width="100%" height="100%" minHeight={180}>
                  <LineChart data={turnoverData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#000', color: '#fff', borderRadius: '8px', border: 'none' }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Line type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={4} dot={{ r: 4, fill: '#3B82F6', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* ================= CART ================= */}
              <CartSummary data={cartData} />

              {/* ================= KPI GRID ================= */}
              <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
                <KPI icon="mdi:finance" title="Monthly Investment" value={`₹ ${kpi.thisMonthInvestment.toLocaleString()}`} trend={kpi.thisMonthInvestmentTrend} color="red" />
                <KPI icon="mdi:cash-multiple" title="Monthly Profit" value={`₹ ${kpi.thisMonthProfit.toLocaleString()}`} trend={kpi.thisMonthProfitTrend} color={kpi.thisMonthProfit >= 0 ? "green" : "red"} />
                <KPI icon="mdi:currency-inr" title="Monthly Turnover" value={`₹ ${kpi.monthlyTurnover.toLocaleString()}`} trend={kpi.monthlyTurnoverTrend} />
                <KPI icon="mdi:shopping" title="This Month Orders" value={kpi.thisMonthOrders} trend={kpi.thisMonthOrdersTrend} />
              </div>
            </div>
          </>
        )}

        {/* Pass props to reports to handle filtering */}
        {/* Pass props to reports to handle filtering */}
        {activeReport !== "dashboard" && (
          <ReportLayout
            title={activeReport === "investment" ? "Investment Report (Expenses)" :
              activeReport === "profit" ? "Profit / Loss Report" :
                activeReport === "day" ? "Start / Close Day Report" :
                  activeReport === "sale" ? "Sale Summary" : "Receipt"}
            onFilter={(range) => setDateRange(range)}
          >
            {activeReport === "receipt" && <ReceiptReport orders={filteredOrders} />}
            {activeReport === "sale" && <SaleReport orders={filteredOrders} />}
            {activeReport === "investment" && <InvestmentReport expenses={expenses} dateRange={dateRange} />}
            {activeReport === "profit" && <ProfitReport orders={orders} expenses={expenses} dateRange={dateRange} />}
            {activeReport === "day" && <DayReport orders={filteredOrders} />}
          </ReportLayout>
        )}
      </div>
    </PageWrapper>
  );
}

/* ================= COMPONENT HELPERS ================= */

function KPI({ icon, title, value, trend, color = "blue" }) {
  const colorClasses = {
    blue: "text-blue-600 bg-blue-50 group-hover:bg-blue-600",
    green: "text-green-600 bg-green-50 group-hover:bg-green-600",
    red: "text-red-600 bg-red-50 group-hover:bg-red-600",
  };

  return (
    <div className="bg-white border border-gray-100 rounded-3xl p-6 min-h-[140px] shadow-sm hover:shadow-lg transition-all duration-300 group">
      <div className={`flex items-center gap-3 mb-4 w-fit px-3 py-1.5 rounded-full group-hover:text-white transition-colors ${colorClasses[color]}`}>
        <Icon icon={icon} width={18} />
        <p className="text-xs font-bold uppercase tracking-wide">{title}</p>
      </div>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
      <p className={`text-xs font-medium mt-2 flex items-center gap-1 ${trend.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
        <Icon icon={trend.startsWith('+') ? "mdi:trending-up" : "mdi:trending-down"} /> {trend} month/month
      </p>
    </div>
  );
}

function ReportTab({ icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`
        rounded-2xl sm:rounded-3xl border p-4 sm:p-6 text-center shadow-sm flex flex-col items-center justify-center gap-2 sm:gap-3
        transition-all duration-300 ease-out min-h-[120px] sm:min-h-[140px]
        hover:-translate-y-1 hover:shadow-lg
        ${active ? "bg-white border-blue-100 ring-4 ring-blue-50/50 scale-105 shadow-xl z-10" : "bg-white border-gray-200 hover:bg-gray-50"}
      `}
    >
      <div className={`p-3 rounded-full ${active ? "bg-blue-50" : "bg-gray-50 group-hover:bg-white"}`}>
        <Icon icon={icon} width="32" className={`transition-colors duration-300 ${active ? "text-blue-600" : "text-gray-400"}`} />
      </div>
      <p className={`text-sm font-bold ${active ? "text-gray-900" : "text-gray-500"}`}>{label}</p>
    </button>
  );
}

function DateInput({ label, value, onChange }) {
  const inputRef = useRef(null);
  const openPicker = () => inputRef.current?.showPicker?.() || inputRef.current?.focus();
  return (
    <div className="space-y-1">
      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide">{label}</label>
      <div className="relative group">
        <input
          ref={inputRef}
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-11 w-full sm:w-44 rounded-xl border border-gray-200 px-4 pr-10 text-sm font-medium outline-none focus:border-blue-500 bg-white"
        />
        <Calendar size={18} onClick={openPicker} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer" />
      </div>
    </div>
  );
}

function ReceiptReport({ orders }) {
  // Group orders by Date
  const groupedOrders = orders.reduce((acc, o) => {
    const date = new Date(o.createdAt).toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'short', day: 'numeric'
    });
    if (!acc[date]) acc[date] = [];
    acc[date].push(o);
    return acc;
  }, {});

  // Sort dates descending (newest first)
  const sortedDates = Object.keys(groupedOrders).sort((a, b) => new Date(b) - new Date(a));

  if (orders.length === 0) {
    return <div className="p-10 text-center text-gray-500 bg-white border rounded-xl">No receipts found for the selected period.</div>
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-nowrap sm:text-wrap">
          <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
            <tr className="text-left font-bold text-gray-600 border-b border-gray-200">
              {["Bill No", "Tax", "Discount", "Payment", "Floor", "Pricing"].map(h => <th key={h} className="px-6 py-4">{h}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y">
            {sortedDates.map(date => (
              <>
                {/* Date Header Row */}
                <tr key={date} className="bg-gray-100/50">
                  <td colSpan="6" className="px-6 py-3 font-bold text-gray-800 text-xs uppercase tracking-wider border-y border-gray-200">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                      {date} ({groupedOrders[date].length} Receipts)
                    </div>
                  </td>
                </tr>
                {/* Orders for this date */}
                {groupedOrders[date].map((o, i) => (
                  <tr key={o._id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="px-6 py-3 font-medium text-gray-900">#{o._id.slice(-6).toUpperCase()}</td>
                    <td className="px-6 py-3 text-gray-500">₹{(o.taxAmount || Math.round(o.totalAmount * 0.05))}</td>
                    <td className="px-6 py-3 text-gray-500">₹{(o.discountAmount || 0)}</td>
                    <td className="px-6 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${o.paymentMethod === 'Cash' ? 'bg-green-50 text-green-700 border-green-100' :
                        o.paymentMethod === 'Online' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                          'bg-gray-50 text-gray-600 border-gray-200'
                        }`}>
                        {o.paymentMethod || "Pending"}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-gray-600">{o.tableNo}</td>
                    <td className="px-6 py-3 text-right font-bold text-gray-900">₹{o.totalAmount}</td>
                  </tr>
                ))}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SaleReport({ orders }) {
  // Group by Date
  const grouped = orders.reduce((acc, o) => {
    const date = new Date(o.createdAt).toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'short', day: 'numeric'
    });
    if (!acc[date]) acc[date] = [];
    acc[date].push(o);
    return acc;
  }, {});

  const sortedDates = Object.keys(grouped).sort((a, b) => new Date(b) - new Date(a));

  if (orders.length === 0) return <div className="p-10 text-center text-gray-500 bg-white border rounded-xl">No sales found.</div>

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-nowrap sm:text-wrap">
          <thead className="border-b border-gray-200 bg-gray-50 sticky top-0">
            <tr className="text-left font-medium">
              {["Bill No", "Order Status", "Net Sale", "Total Sale"].map(h => <th key={h} className="px-6 py-4">{h}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y">
            {sortedDates.map(date => (
              <>
                <tr key={date} className="bg-gray-100/50">
                  <td colSpan="4" className="px-6 py-3 font-bold text-gray-800 text-xs uppercase tracking-wider border-y border-gray-200">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                      {date}
                    </div>
                  </td>
                </tr>
                {grouped[date].map((o, i) => (
                  <tr key={o._id} className="hover:bg-gray-50">
                    <td className="px-6 py-3">#{o._id.slice(-6).toUpperCase()}</td>
                    <td className="px-6 py-3 capitalize">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${o.status === 'completed' ? 'bg-green-100 text-green-700' :
                        o.status === 'pending' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="px-6 py-3">₹{(o.totalAmount * 0.95).toFixed(0)}</td>
                    <td className="px-6 py-3 font-bold">₹{o.totalAmount}</td>
                  </tr>
                ))}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function InvestmentReport({ expenses, dateRange }) {
  const filtered = expenses.filter(e => {
    const d = new Date(e.date).getTime();
    const start = dateRange.from ? new Date(dateRange.from).setHours(0, 0, 0, 0) : 0;
    const end = dateRange.to ? new Date(dateRange.to).setHours(23, 59, 59, 999) : Infinity;
    return d >= start && d <= end;
  });

  // Group by Month
  const monthly = filtered.reduce((acc, e) => {
    const month = new Date(e.date).toLocaleString('en-US', { month: 'long', year: 'numeric' });
    if (!acc[month]) acc[month] = 0;
    acc[month] += e.amount;
    return acc;
  }, {});

  // Group by Year
  const yearly = filtered.reduce((acc, e) => {
    const year = new Date(e.date).getFullYear();
    if (!acc[year]) acc[year] = 0;
    acc[year] += e.amount;
    return acc;
  }, {});

  const handleExport = () => {
    const data = filtered.map(e => ({
      Date: new Date(e.date).toLocaleDateString(),
      User: e.user,
      Description: e.description,
      Amount: e.amount
    }));
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Investments");
    XLSX.writeFile(workbook, `Investment_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success("Investment Report Exported");
  };

  if (filtered.length === 0) return <div className="p-10 text-center text-gray-500 bg-white border rounded-xl">No investment data found for this period.</div>;

  return (
    <div className="space-y-8">
      <div className="flex justify-end">
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-6 py-2.5 bg-black text-white rounded-xl text-sm font-bold shadow-lg hover:bg-gray-800 transition-all active:scale-95"
        >
          <Download size={16} /> Export Investment Excel
        </button>
      </div>

      {/* Monthly Summary */}
      <div className="bg-white border rounded-2xl overflow-hidden shadow-sm">
        <div className="bg-gray-50 px-6 py-4 border-b">
          <h3 className="font-bold text-gray-800">Monthly Investment</h3>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50/50 text-gray-500 uppercase text-[10px] font-bold">
            <tr>
              <th className="px-6 py-3 text-left">Month</th>
              <th className="px-6 py-3 text-right">Total Invested</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {Object.entries(monthly).sort((a, b) => new Date(b[0]) - new Date(a[0])).map(([month, total]) => (
              <tr key={month} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium">{month}</td>
                <td className="px-6 py-4 text-right font-bold text-red-600">₹{total.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Yearly Summary */}
      <div className="bg-white border rounded-2xl overflow-hidden shadow-sm">
        <div className="bg-gray-50 px-6 py-4 border-b">
          <h3 className="font-bold text-gray-800">Yearly Investment</h3>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50/50 text-gray-500 uppercase text-[10px] font-bold">
            <tr>
              <th className="px-6 py-3 text-left">Year</th>
              <th className="px-6 py-3 text-right">Total Invested</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {Object.entries(yearly).sort((a, b) => b[0] - a[0]).map(([year, total]) => (
              <tr key={year} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium">{year}</td>
                <td className="px-6 py-4 text-right font-bold text-red-600">₹{total.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ProfitReport({ orders, expenses, dateRange }) {
  const start = dateRange.from ? new Date(dateRange.from).setHours(0, 0, 0, 0) : 0;
  const end = dateRange.to ? new Date(dateRange.to).setHours(23, 59, 59, 999) : Infinity;

  const filteredOrders = orders.filter(o => {
    const d = new Date(o.createdAt).getTime();
    return d >= start && d <= end;
  });

  const filteredExpenses = expenses.filter(e => {
    const d = new Date(e.date).getTime();
    return d >= start && d <= end;
  });

  // Consolidate data by month
  const monthlyData = {};

  filteredOrders.forEach(o => {
    const month = new Date(o.createdAt).toLocaleString('en-US', { month: 'long', year: 'numeric' });
    if (!monthlyData[month]) monthlyData[month] = { revenue: 0, investment: 0 };
    monthlyData[month].revenue += (o.totalAmount || 0);
  });

  filteredExpenses.forEach(e => {
    const month = new Date(e.date).toLocaleString('en-US', { month: 'long', year: 'numeric' });
    if (!monthlyData[month]) monthlyData[month] = { revenue: 0, investment: 0 };
    monthlyData[month].investment += (e.amount || 0);
  });

  // Consolidate data by year
  const yearlyData = {};
  filteredOrders.forEach(o => {
    const year = new Date(o.createdAt).getFullYear();
    if (!yearlyData[year]) yearlyData[year] = { revenue: 0, investment: 0 };
    yearlyData[year].revenue += (o.totalAmount || 0);
  });
  filteredExpenses.forEach(e => {
    const year = new Date(e.date).getFullYear();
    if (!yearlyData[year]) yearlyData[year] = { revenue: 0, investment: 0 };
    yearlyData[year].investment += (e.amount || 0);
  });

  const handleExport = () => {
    const data = Object.entries(monthlyData).map(([month, stats]) => ({
      Month: month,
      Revenue: stats.revenue,
      Investment: stats.investment,
      Profit: stats.revenue - stats.investment
    }));
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Profit_Loss");
    XLSX.writeFile(workbook, `Profit_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success("Profit Report Exported");
  };

  if (Object.keys(monthlyData).length === 0) return <div className="p-10 text-center text-gray-500 bg-white border rounded-xl">No profit/loss data found for this period.</div>;

  return (
    <div className="space-y-8">
      <div className="flex justify-end">
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-6 py-2.5 bg-black text-white rounded-xl text-sm font-bold shadow-lg hover:bg-gray-800 transition-all active:scale-95"
        >
          <Download size={16} /> Export Profit Excel
        </button>
      </div>

      {/* Monthly Profit */}
      <div className="bg-white border rounded-2xl overflow-hidden shadow-sm">
        <div className="bg-gray-50 px-6 py-4 border-b">
          <h3 className="font-bold text-gray-800">Monthly Profit / Loss</h3>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50/50 text-gray-500 uppercase text-[10px] font-bold">
            <tr>
              <th className="px-6 py-3 text-left">Month</th>
              <th className="px-6 py-3 text-right">Revenue</th>
              <th className="px-6 py-3 text-right">Investment</th>
              <th className="px-6 py-3 text-right">Profit</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {Object.entries(monthlyData).sort((a, b) => new Date(b[0]) - new Date(a[0])).map(([month, data]) => {
              const profit = data.revenue - data.investment;
              return (
                <tr key={month} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">{month}</td>
                  <td className="px-6 py-4 text-right text-gray-600">₹{data.revenue.toLocaleString()}</td>
                  <td className="px-6 py-4 text-right text-gray-600">₹{data.investment.toLocaleString()}</td>
                  <td className={`px-6 py-4 text-right font-bold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ₹{profit.toLocaleString()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Yearly Profit */}
      <div className="bg-white border rounded-2xl overflow-hidden shadow-sm">
        <div className="bg-gray-50 px-6 py-4 border-b">
          <h3 className="font-bold text-gray-800">Yearly Profit / Loss</h3>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50/50 text-gray-500 uppercase text-[10px] font-bold">
            <tr>
              <th className="px-6 py-3 text-left">Year</th>
              <th className="px-6 py-3 text-right">Revenue</th>
              <th className="px-6 py-3 text-right">Investment</th>
              <th className="px-6 py-3 text-right">Profit</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {Object.entries(yearlyData).sort((a, b) => b[0] - a[0]).map(([year, data]) => {
              const profit = data.revenue - data.investment;
              return (
                <tr key={year} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">{year}</td>
                  <td className="px-6 py-4 text-right text-gray-600">₹{data.revenue.toLocaleString()}</td>
                  <td className="px-6 py-4 text-right text-gray-600">₹{data.investment.toLocaleString()}</td>
                  <td className={`px-6 py-4 text-right font-bold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ₹{profit.toLocaleString()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function DayReport({ orders }) {
  const [activeShift, setActiveShift] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openingCash, setOpeningCash] = useState("");
  const [closingCash, setClosingCash] = useState("");
  const [showModal, setShowModal] = useState(false); // 'start' or 'close'

  const fetchActiveShift = async () => {
    try {
      const res = await api.get('/shifts/active');
      setActiveShift(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching active shift", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveShift();
  }, [orders]); // Refresh when orders change (real-time socket support)

  const handleStartShift = async () => {
    if (!openingCash) return toast.error("Please enter opening cash amount");
    try {
      await api.post('/shifts/start', { openingCash: parseFloat(openingCash) });
      toast.success("Shift started successfully");
      setShowModal(false);
      setOpeningCash("");
      fetchActiveShift();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to start shift");
    }
  };

  const handleCloseShift = async () => {
    if (!closingCash) return toast.error("Please enter closing cash amount");
    try {
      await api.post('/shifts/close', { closingCash: parseFloat(closingCash) });
      toast.success("Shift closed successfully");
      setShowModal(false);
      setClosingCash("");
      fetchActiveShift();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to close shift");
    }
  };

  if (loading) return <div className="p-10 text-center">Loading shift status...</div>;

  return (
    <div className="space-y-6">
      {/* ACTIVE SHIFT PANEL */}
      {!activeShift ? (
        <div className="bg-white border rounded-3xl p-8 text-center shadow-sm">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon icon="mdi:clock-start" width={32} className="text-blue-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">No Active Shift</h2>
          <p className="text-gray-500 mb-6">Start your business day by recording the opening cash in your drawer.</p>
          <button
            onClick={() => setShowModal('start')}
            className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:bg-blue-700 transition-all active:scale-95"
          >
            Start Business Day
          </button>
        </div>
      ) : (
        <div className="bg-white border rounded-3xl overflow-hidden shadow-sm">
          <div className="bg-blue-600 p-6 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <p className="text-blue-100 text-xs font-bold uppercase tracking-wider">Active Shift Running</p>
              <h2 className="text-xl sm:text-2xl font-bold">Started at {new Date(activeShift.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</h2>
            </div>
            <button
              onClick={() => setShowModal('close')}
              className="w-full sm:w-auto px-6 py-2 bg-white text-blue-600 font-bold rounded-lg shadow-sm hover:bg-blue-50 transition-colors"
            >
              End Shift / Close Day
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-100 border-b">
            <div className="p-6">
              <p className="text-xs text-gray-500 font-bold uppercase mb-1">Opening Cash</p>
              <p className="text-xl font-bold text-gray-900">₹{activeShift.openingCash}</p>
            </div>
            <div className="p-6">
              <p className="text-xs text-gray-500 font-bold uppercase mb-1">Cash Sales</p>
              <p className="text-xl font-bold text-green-600">₹{activeShift.cashSales}</p>
            </div>
            <div className="p-6">
              <p className="text-xs text-gray-500 font-bold uppercase mb-1">Online Sales</p>
              <p className="text-xl font-bold text-blue-600">₹{activeShift.onlineSales}</p>
            </div>
            <div className="p-6">
              <p className="text-xs text-gray-500 font-bold uppercase mb-1">Expected Cash</p>
              <p className="text-xl font-bold text-orange-600">₹{activeShift.expectedCash}</p>
            </div>
          </div>
        </div>
      )}

      {/* MODALS */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl animate-scale-in">
            <h3 className="text-xl font-bold text-gray-900 mb-6">
              {showModal === 'start' ? 'Start Business Day' : 'Close Business Day'}
            </h3>

            <div className="space-y-4 mb-8">
              {showModal === 'start' ? (
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Opening Cash in Counter</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
                    <input
                      type="number"
                      value={openingCash}
                      onChange={(e) => setOpeningCash(e.target.value)}
                      placeholder="0.00"
                      className="w-full h-12 pl-8 pr-4 bg-gray-50 border rounded-xl outline-none focus:ring-2 ring-blue-500/20"
                    />
                  </div>
                </div>
              ) : (
                <>
                  <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 mb-4">
                    <p className="text-sm text-orange-800">
                      Expected cash in drawer: <span className="font-bold">₹{activeShift.expectedCash}</span>
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Actual Cash in Counter</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
                      <input
                        type="number"
                        value={closingCash}
                        onChange={(e) => setClosingCash(e.target.value)}
                        placeholder="0.00"
                        className="w-full h-12 pl-8 pr-4 bg-gray-50 border rounded-xl outline-none focus:ring-2 ring-blue-500/20"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={showModal === 'start' ? handleStartShift : handleCloseShift}
                className={`flex-1 py-3 text-white font-bold rounded-xl shadow-lg transition-all active:scale-95 ${showModal === 'start' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-red-600 hover:bg-red-700'
                  }`}
              >
                {showModal === 'start' ? 'Start Day' : 'Close Day'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HISTORICAL LOG */}
      <div className="space-y-4">
        <h3 className="font-bold text-gray-900 border-b pb-2">Shift History</h3>
        <HistoricalShifts />
      </div>
    </div>
  );
}

function HistoricalShifts() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/shifts/history').then(res => {
      setHistory(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-4 text-center text-xs text-gray-400">Loading history...</div>;
  if (history.length === 0) return <div className="p-8 text-center text-gray-400 bg-gray-50 rounded-2xl border border-dashed text-sm">No past shifts recorded yet.</div>;

  return (
    <div className="bg-white border rounded-2xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-nowrap sm:text-wrap">
          <thead className="bg-gray-50">
            <tr className="text-left font-bold text-gray-600 border-b">
              <th className="px-6 py-3">Date / Shift</th>
              <th className="px-6 py-3">Opening</th>
              <th className="px-6 py-3">Sales (Cash)</th>
              <th className="px-6 py-3">Closing (Actual)</th>
              <th className="px-6 py-3">Discrepancy</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {history.map(s => {
              const discrepancy = s.closingCash - s.expectedCash;
              return (
                <tr key={s._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-bold text-gray-900">{new Date(s.startTime).toLocaleDateString()}</p>
                    <p className="text-[10px] text-gray-400 capitalize">{s.status} at {new Date(s.endTime || s.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </td>
                  <td className="px-6 py-4 text-gray-600">₹{s.openingCash}</td>
                  <td className="px-6 py-4 text-gray-600">₹{s.cashSales}</td>
                  <td className="px-6 py-4 font-bold text-gray-800">₹{s.closingCash || 0}</td>
                  <td className="px-6 py-4">
                    {s.status === 'closed' ? (
                      <span className={`font-bold ${discrepancy === 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {discrepancy > 0 ? `+₹${discrepancy}` : discrepancy < 0 ? `-₹${Math.abs(discrepancy)}` : 'Matched'}
                      </span>
                    ) : <span className="text-blue-500 italic">Running...</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ReportLayout({ title, children, onFilter, categories = [], selectedCategory, onCategoryChange }) {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const handleSearch = () => {
    onFilter({ from, to });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">{title}</h2>
      <div className="bg-white border rounded-xl p-5 flex flex-wrap gap-4 items-end shadow-sm">
        <DateInput label="FROM" value={from} onChange={setFrom} />
        <DateInput label="TO" value={to} onChange={setTo} />
        <button
          onClick={handleSearch}
          className="px-6 py-2 bg-black text-white rounded-lg text-sm font-bold shadow-md hover:bg-gray-800 transition-all active:scale-95 h-11"
        >
          Search
        </button>

        {/* Category Filter */}
        {categories.length > 0 && (
          <div className="ml-auto space-y-1">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="h-11 w-48 rounded-xl border border-gray-200 px-4 text-sm font-medium outline-none focus:border-blue-500 bg-white"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        )}
      </div>
      {children}
    </div>
  );
}

