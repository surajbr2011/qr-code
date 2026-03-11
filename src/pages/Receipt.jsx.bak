import { useState } from "react";
import PageWrapper from "../components/layout/PageWrapper";
import { Plus, Minus, Printer } from "lucide-react";
import { useCart } from "../context/CartContext";


export default function Receipt() {
  const products = [
    {
      id: 1,
      name: "Paneer Tikka",
      price: 250,
      image: "https://images.unsplash.com/photo-1600891964599-f61ba0e24092",
    },
    {
      id: 2,
      name: "Veg Burger",
      price: 180,
      image: "https://images.unsplash.com/photo-1550547660-d9450f859349",
    },
  ];

  const { cart, table, addItem, removeItem } = useCart();

  /* ---------------- CART LOGIC ---------------- */

  // Using addItem / removeItem from CartContext to mutate cart state


  const orderItems = Object.values(cart);

  const subtotal = orderItems.reduce(
    (sum, i) => sum + i.qty * i.price,
    0
  );
  const tax = Math.round(subtotal * 0.05);
  const total = subtotal + tax;

  const handlePrint = () => window.print();

  return (
    <PageWrapper>
      <div className="animate-page">
        {/* Title */}
        <h1 className="text-2xl font-semibold mb-1">Receipt</h1>
        <p className="text-sm text-gray-500 mb-6">
          Manage your restaurant receipt
        </p>

        {/* Main Bill Card */}
        <div className="bg-white border border-gray-100 rounded-3xl p-8 max-w-6xl animate-card print-area shadow-lg">
          <h2 className="font-bold text-xl mb-6">Bill</h2>

          {/* Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <input className="input" placeholder="Table Number" />
            <input className="input" placeholder="Customer Name" />
          </div>

          {/* Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Order Items */}
            <div className="bg-gray-50/50 rounded-3xl border border-gray-100 p-6 shadow-sm animate-card">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-6">Order Items</h3>

              {orderItems.length === 0 ? (
                <p className="text-sm text-gray-400 italic">
                  No items added yet.
                </p>
              ) : (
                <div className="space-y-4">
                  {orderItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between items-center bg-white p-3 rounded-2xl shadow-sm border border-gray-100"
                    >
                      <div className="flex items-center gap-4">
                        <img
                          src={item.image || "https://via.placeholder.com/48"}
                          className="w-14 h-14 rounded-xl object-cover"
                        />
                        <div>
                          <p className="font-bold text-gray-900 text-sm">
                            {item.name}
                          </p>
                          <p className="text-xs font-semibold text-gray-500 mt-0.5">
                            Qty: <span className="text-black">{item.qty}</span>
                          </p>
                        </div>
                      </div>

                      <p className="text-sm font-bold text-gray-900 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
                        ₹ {item.qty * item.price}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Summary */}
              <div className="border-t border-dashed border-gray-200 mt-8 pt-6 space-y-3 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({orderItems.reduce((s, i) => s + i.qty, 0)})</span>
                  <span className="font-medium">₹ {subtotal}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax (5%)</span>
                  <span className="font-medium">₹ {tax}</span>
                </div>
                <div className="flex justify-between font-bold text-lg text-black pt-3 border-t border-gray-100">
                  <span>Total</span>
                  <span>₹ {total}</span>
                </div>
              </div>
            </div>

            {/* Add Product */}
            <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm animate-card delay-100 h-fit">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-6">Add Product</h3>

              {/* Search / Select */}
              <div className="mb-6">
                <div className="relative">
                  <input
                    placeholder="Search item to add..."
                    className="input w-full pr-10"
                  />
                </div>
              </div>

              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {products.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center text-sm p-3 hover:bg-gray-50 rounded-2xl transition-colors border border-transparent hover:border-gray-100"
                  >
                    <div>
                      <p className="font-bold text-gray-900">{item.name}</p>
                      <p className="text-xs font-semibold text-gray-400">₹ {item.price}.00 Rs</p>
                    </div>

                    <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-full px-2 py-1 shadow-sm">
                      <button
                        onClick={() => removeItem(item)}
                        className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-600 transition-colors"
                        aria-label={`remove ${item.name}`}
                      >
                        <Minus size={14} />
                      </button>

                      <span className="w-4 text-center text-sm font-bold text-black">{cart[item.id]?.qty || 0}</span>

                      <button
                        onClick={() => addItem(item)}
                        className="w-6 h-6 flex items-center justify-center rounded-full bg-black text-white hover:bg-gray-800 transition-colors shadow-sm"
                        aria-label={`add ${item.name}`}
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4 mt-8 print-hidden">
            <button
              onClick={handlePrint}
              className="bg-black text-white px-8 py-3 rounded-full text-sm font-bold shadow-lg hover:shadow-xl hover:bg-gray-800 hover:-translate-y-0.5 transition-all duration-300"
            >
              <Printer size={16} className="inline mr-2" />
              Print & Save
            </button>

            <button
              onClick={() => alert('Print KOT')}
              className="bg-white border text-gray-700 hover:border-black hover:text-black px-6 py-3 rounded-full text-sm font-bold transition-all duration-300"
            >
              Print KOT
            </button>

            <button
              onClick={() => alert('Print Bill')}
              className="bg-white border text-gray-700 hover:border-black hover:text-black px-6 py-3 rounded-full text-sm font-bold transition-all duration-300"
            >
              Print Bill
            </button>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
