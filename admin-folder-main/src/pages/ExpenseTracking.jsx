import { useState, useRef, useEffect } from "react";
import PageWrapper from "../components/layout/PageWrapper";
import { Calendar, Trash2, Download, FilterX } from "lucide-react";
import api from "../utils/api";
import toast from "react-hot-toast";
import BarChart from "../components/charts/BarChart";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export default function ExpenseTracking() {
  const [activeTab, setActiveTab] = useState("add");
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [formData, setFormData] = useState({
    user: "",
    description: "",
    amount: "",
    date: ""
  });

  // Filter state
  const [filterFrom, setFilterFrom] = useState("");
  const [filterTo, setFilterTo] = useState("");

  // Fetch Expenses
  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/expenses");
      setExpenses(data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || err.message || "Failed to fetch expenses");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleAddExpense = async () => {
    if (!formData.user || !formData.description || !formData.amount) {
      toast.error("Please fill all fields");
      return;
    }

    try {
      await api.post("/expenses", {
        ...formData,
        date: formData.date || new Date()
      });
      toast.success("Expense Added");
      setFormData({ user: "", description: "", amount: "", date: "" });
      fetchExpenses();
      setActiveTab("overview");
    } catch (err) {
      toast.error("Failed to add expense");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this expense?")) return;
    try {
      await api.delete(`/expenses/${id}`);
      toast.success("Expense Deleted");
      fetchExpenses();
    } catch (err) {
      toast.error("Failed to delete");
    }
  };

  // Excel Export
  const handleDownloadExcel = () => {
    if (filteredExpenses.length === 0) {
      toast.error("No data to export");
      return;
    }

    const dataToExport = filteredExpenses.map(e => ({
      Date: new Date(e.date).toLocaleDateString(),
      User: e.user,
      Description: e.description,
      Amount: e.amount
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Expenses");

    /* generate buffer */
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8" });
    saveAs(data, `Expenses_${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success("Excel File Downloaded");
  };

  // Calculations for Overview
  const totalExpense = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const thisMonthExpenses = expenses.filter(e => {
    const d = new Date(e.date);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).reduce((acc, curr) => acc + curr.amount, 0);

  const getChartData = () => {
    const last7Days = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    return last7Days.map(date => {
      const dayTotal = expenses
        .filter(e => e.date.split('T')[0] === date)
        .reduce((acc, curr) => acc + curr.amount, 0);

      return {
        name: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
        value: dayTotal
      };
    });
  };

  // Filter expenses based on date range
  const filteredExpenses = expenses.filter(e => {
    const expenseDate = e.date.split('T')[0];
    if (filterFrom && expenseDate < filterFrom) return false;
    if (filterTo && expenseDate > filterTo) return false;
    return true;
  });

  return (
    <PageWrapper>
      <div className="animate-page px-2 sm:px-0 space-y-8">

        {/* ================= TITLE ================= */}
        <h1 className="text-xl sm:text-2xl font-bold text-black">
          Expense Tracking
        </h1>

        {/* ================= TABS ================= */}
        <div className="flex gap-3">
          <button
            onClick={() => setActiveTab("add")}
            className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${activeTab === "add"
              ? "bg-black text-white shadow-md transform scale-105"
              : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:text-black"
              }`}
          >
            Add New Expense
          </button>

          <button
            onClick={() => setActiveTab("overview")}
            className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${activeTab === "overview"
              ? "bg-black text-white shadow-md transform scale-105"
              : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:text-black"
              }`}
          >
            Overview
          </button>
        </div>

        {/* ================= ADD NEW EXPENSE ================= */}
        {activeTab === "add" && (
          <div className="bg-white rounded-3xl border border-gray-100 p-8 max-w-4xl shadow-lg">

            <h2 className="font-bold text-xl mb-8">
              Add New Expense
            </h2>

            <div className="space-y-6">
              {/* User */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  User / Staff Name
                </label>
                <input
                  value={formData.user}
                  onChange={(e) => setFormData({ ...formData, user: e.target.value })}
                  placeholder="e.g. John Doe"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-300"
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  placeholder="e.g. Bought 5kg Oil"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm resize-none outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-300"
                />
              </div>

              {/* Amount & Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Amount (₹)
                  </label>
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="100"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-300"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Expense Date
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-300"
                  />
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-4 mt-10">
              <button
                onClick={() => setFormData({ user: "", description: "", amount: "", date: "" })}
                className="px-8 py-2.5 rounded-full border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-colors">
                Clear
              </button>

              <button
                onClick={handleAddExpense}
                className="px-8 py-2.5 rounded-full bg-black text-white text-sm font-bold shadow-lg hover:bg-gray-900 hover:scale-105 active:scale-95 transition-all duration-300">
                Add Expense
              </button>
            </div>
          </div>
        )}

        {/* ================= OVERVIEW ================= */}
        {activeTab === "overview" && (
          <>
            {/* ===== CHART + SUMMARY ===== */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

              {/* Expense Trends */}
              <div className="bg-white rounded-3xl border border-gray-100 p-2 shadow-sm hover:shadow-lg transition-all duration-300">
                <BarChart data={getChartData()} title="Expense Trends" />
              </div>

              {/* Monthly Summary */}
              <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300">
                <div className="bg-purple-50/80 text-center py-6 px-4">
                  <p className="font-semibold text-purple-900">
                    Total Expenses (All Time)
                  </p>
                  <p className="text-3xl font-bold text-black mt-2">
                    ₹{totalExpense.toFixed(2)}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 p-8">
                  <div className="bg-gray-50 rounded-2xl p-6 text-center hover:bg-gray-100 transition-colors">
                    <p className="text-2xl font-bold text-gray-900">₹{thisMonthExpenses}</p>
                    <p className="text-xs font-semibold text-gray-500 uppercase mt-1">
                      This Month
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-2xl p-6 text-center hover:bg-gray-100 transition-colors">
                    <p className="text-2xl font-bold text-gray-900">{expenses.length}</p>
                    <p className="text-xs font-semibold text-gray-500 uppercase mt-1">
                      Total Count
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* ================= ALL EXPENSES LIST ================= */}
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h2 className="font-semibold text-lg">
                  History
                </h2>

                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                  {/* From Date */}
                  <div
                    className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-1.5 shadow-sm relative group hover:border-black transition-all cursor-pointer"
                    onClick={() => {
                      try { document.getElementById('filterFrom').showPicker(); } catch (e) { }
                    }}
                  >
                    <Calendar size={14} className="text-gray-400 group-hover:text-black transition-colors" />
                    <span className="text-[10px] font-bold text-gray-400 uppercase">From</span>
                    <input
                      id="filterFrom"
                      type="date"
                      value={filterFrom}
                      onChange={(e) => setFilterFrom(e.target.value)}
                      className="text-xs font-bold outline-none bg-transparent cursor-pointer"
                    />
                  </div>

                  {/* To Date */}
                  <div
                    className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-1.5 shadow-sm relative group hover:border-black transition-all cursor-pointer"
                    onClick={() => {
                      try { document.getElementById('filterTo').showPicker(); } catch (e) { }
                    }}
                  >
                    <Calendar size={14} className="text-gray-400 group-hover:text-black transition-colors" />
                    <span className="text-[10px] font-bold text-gray-400 uppercase">To</span>
                    <input
                      id="filterTo"
                      type="date"
                      value={filterTo}
                      onChange={(e) => setFilterTo(e.target.value)}
                      className="text-xs font-bold outline-none bg-transparent cursor-pointer"
                    />
                  </div>

                  {/* Clear Filters */}
                  {(filterFrom || filterTo) && (
                    <button
                      onClick={() => { setFilterFrom(""); setFilterTo(""); }}
                      className="p-2 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition-colors shadow-sm"
                      title="Clear Filters"
                    >
                      <FilterX size={18} />
                    </button>
                  )}

                  {/* Download Button */}
                  <button
                    onClick={handleDownloadExcel}
                    className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-xl text-sm font-bold shadow-lg hover:bg-gray-800 transition-all active:scale-95"
                  >
                    <Download size={16} /> Export Excel
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-lg">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50/50 border-b border-gray-100 text-gray-500">
                    <tr>
                      <th className="text-left px-6 py-4 font-bold uppercase tracking-wider text-xs">Date</th>
                      <th className="text-left px-6 py-4 font-bold uppercase tracking-wider text-xs">User</th>
                      <th className="text-left px-6 py-4 font-bold uppercase tracking-wider text-xs">Description</th>
                      <th className="text-right px-6 py-4 font-bold uppercase tracking-wider text-xs">Amount</th>
                      <th className="text-right px-6 py-4 font-bold uppercase tracking-wider text-xs">Action</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-50">
                    {filteredExpenses.map((expense) => (
                      <tr key={expense._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 font-medium text-gray-900">
                          {new Date(expense.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-900">
                          {expense.user}
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {expense.description}
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-gray-900">
                          ₹{expense.amount}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button onClick={() => handleDelete(expense._id)} className="text-red-500 hover:bg-red-50 p-2 rounded-full">
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {expenses.length === 0 && (
                      <tr>
                        <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                          No expenses recorded yet
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </>
        )}
      </div>
    </PageWrapper>
  );
}