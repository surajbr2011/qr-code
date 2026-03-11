import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import PageWrapper from "../components/layout/PageWrapper";
import { Tag, Plus, Minus, Printer, Search, UtensilsCrossed, Receipt as ReceiptIcon, Trash2, User, CreditCard, ArrowLeft, X } from "lucide-react";
import { useCart } from "../context/CartContext";
import api from "../utils/api";
import toast from "react-hot-toast";
import menuData from "../data/menuData";

export default function Receipt() {
  const location = useLocation();
  const isTakeaway = location.state?.mode === 'takeaway';

  const [menuItems, setMenuItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [search, setSearch] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [manualTable, setManualTable] = useState(isTakeaway ? "Takeaway" : "");
  const [existingOrderId, setExistingOrderId] = useState(null);
  const [printMode, setPrintMode] = useState("bill"); // 'bill' or 'kot'

  // OFFERS STATE
  const [availableOffers, setAvailableOffers] = useState([]);
  const [showOfferModal, setShowOfferModal] = useState(false);

  const { cart, addItem, removeItem, clearCart, activeOffer, activateOffer, deactivateOffer } = useCart();
  const orderItems = Object.values(cart);


  useEffect(() => {
    // Load local menu data directly
    setMenuItems(menuData);

    // Do not clear cart here automatically if redirecting from Menu page with items
    // But logically, if we come from Menu page, the cart is already displaying current context.
    // However, the previous logic had a clearCart() call. 
    // If we want to support "Quick Bill" from Tables -> Menu -> Receipt, the cart is in the global context.
    // So we should NOT clear cart on mount unless explicitly intended.
    // But normally navigating to Receipt might imply a new session? 
    // Let's stick to the previous logic but be careful.
    // The previous logic cleared cart THEN re-added items if `location.state.order` existed.
    // If coming from "Quick Bill" (Menu.jsx), items are ALREADY in `useCart`.
    // We should checking if we have `location.state.order` (editing existing order) vs just navigating.

    // If we are coming from Menu.jsx "Bill Table", we might just want to use the current cart.
    // Let's rely on the user having added items to the cart in the Menu page.

    setCustomerName("");
    setCustomerEmail("");
    setExistingOrderId(null);

    if (isTakeaway) {
      setManualTable("Takeaway");
    } else {
      setManualTable("");
    }

    if (location.state?.tableId) {
      setManualTable(location.state.tableId);
    }

    if (location.state?.order) {
      const order = location.state.order;
      setExistingOrderId(order._id);
      setCustomerName(order.guestInfo?.name || order.customerName || "");
      setCustomerEmail(order.guestInfo?.email || order.customerEmail || "");

      // If editing an order, we overwrite the cart
      clearCart();
      order.items.forEach(it => {
        addItem({
          _id: it.menuItem || it._id,
          name: it.name,
          price: it.price,
          image: it.image
        }, it.qty || it.quantity);
      });
    }

    // Fetch Offers
    const fetchOffers = async () => {
      try {
        const { data } = await api.get('/offers');
        setAvailableOffers(data.filter(o => o.isActive));
      } catch (err) {
        console.error("Failed to fetch offers", err);
      }
    };
    fetchOffers();
  }, [location.state]);

  // Payment State
  const [isPaymentVerified, setPaymentVerified] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState(null); // 'upi', 'cash', 'card'

  // CALCULATE TOTALS WITH OFFER
  const originalSubtotal = orderItems.reduce((sum, i) => sum + (i.price * i.qty), 0);
  const subtotal = orderItems.reduce((sum, i) => {
    let price = i.price;
    if (activeOffer && activeOffer.discount) {
      price = i.price - (i.price * (activeOffer.discount / 100));
    }
    return sum + (price * i.qty);
  }, 0);

  const totalSavings = originalSubtotal - subtotal;
  const tax = Math.round(subtotal * 0.05);
  const total = subtotal + tax;

  // 1. Create Initial Order (Pending Status)
  const createOrder = async () => {
    if (orderItems.length === 0) throw new Error("Cart is empty");
    if (!isTakeaway && !manualTable) throw new Error("Enter Table Number");

    const payload = {
      tableNo: manualTable,
      customerInfo: { name: customerName || "Guest", email: customerEmail },
      items: orderItems.map(i => {
        let finalPrice = i.price;
        if (activeOffer && activeOffer.discount) {
          finalPrice = i.price - (i.price * (activeOffer.discount / 100));
        }
        return {
          menuItem: i._id,
          name: i.name,
          price: finalPrice,
          qty: i.qty
        };
      }),
      totalAmount: total,
      status: "confirm",
      paymentStatus: "pending",
      type: isTakeaway ? 'self-service' : 'table',
      offerApplied: activeOffer ? { id: activeOffer._id, discount: activeOffer.discount, title: activeOffer.title } : null
    };

    if (existingOrderId) {
      await api.put(`/orders/${existingOrderId}`, payload);
      return existingOrderId;
    } else {
      const { data } = await api.post("/orders", payload);
      setExistingOrderId(data._id);
      return data._id;
    }
  };

  // 2. Mark as Paid (Manual)
  const handleManualPayment = async (method) => {
    try {
      if (!window.confirm(`Confirm payment of ₹${total} received via ${method.toUpperCase()}?`)) return;

      const loadingToast = toast.loading("Verifying...");
      let orderId = existingOrderId;
      if (!orderId) {
        orderId = await createOrder();
      }

      // Update Backend
      await api.put(`/orders/${orderId}`, {
        paymentStatus: 'paid',
        paymentMethod: method
      });

      toast.dismiss(loadingToast);
      toast.success(`Payment Verified: ${method.toUpperCase()}`);
      setPaymentVerified(true);
      setPaymentMethod(method);
    } catch (err) {
      toast.error(err.message || "Payment Failed");
    }
  };

  // 3. Online Payment (Razorpay)
  const handleOnlinePayment = async () => {
    try {
      const loadingToast = toast.loading("Initializing Payment...");
      let orderId = existingOrderId;
      if (!orderId) {
        orderId = await createOrder(); // Ensure order exists first
      }

      // Create Razorpay Order
      const { data: rpOrder } = await api.post('/razorpay/order', {
        amount: total,
        currency: "INR",
        receipt: orderId
      });

      toast.dismiss(loadingToast);

      // HANDLE MOCK ORDER (If keys are missing)
      if (rpOrder.is_mock) {
        if (window.confirm("⚠️ Test Mode: Razorpay keys are missing on backend.\n\nSimulate successful payment?")) {
          const verifyToast = toast.loading("Simulating Verification...");
          // Update backend status manually since verification signature won't match a mock
          await api.put(`/orders/${orderId}`, {
            paymentStatus: 'paid',
            paymentMethod: 'upi' // Must be one of ['upi', 'cod', 'card', 'cash']
          });
          toast.dismiss(verifyToast);
          toast.success("Mock Payment Successful!");
          setPaymentVerified(true);
          setPaymentMethod('upi (mock)'); // State can be custom, API payload must be enum
        }
        return;
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_YourKeyHere", // Fallback for dev
        amount: rpOrder.amount,
        currency: rpOrder.currency,
        name: "Cinnamon Agonda",
        description: `Table ${manualTable} Bill`,
        image: "https://your-logo-url.com/logo.png", // Optional
        order_id: rpOrder.id,
        handler: async function (response) {
          const verifyToast = toast.loading("Verifying Payment...");
          try {
            await api.post('/razorpay/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId: orderId,
              paymentMethod: 'upi'
            });

            toast.dismiss(verifyToast);
            toast.success("Payment Successful!");
            setPaymentVerified(true);
            setPaymentMethod('online');
          } catch (err) {
            toast.dismiss(verifyToast);
            toast.error("Payment Verification Failed");
          }
        },
        prefill: {
          name: customerName,
          email: customerEmail,
          contact: "" // Ask user?
        },
        theme: {
          color: "#000000"
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (err) {
      toast.dismiss();
      console.error("Payment Start Error:", err);
      toast.error(err.response?.data?.message || err.message || "Failed to start payment");
    }
  };

  const triggerPrint = (mode) => {
    setPrintMode(mode);
    setTimeout(() => window.print(), 500);
  };

  // Define Category Order and Images (Consistent with Menu.jsx)
  // Define Category Order and Images (Consistent with Menu.jsx)
  const knownCategories = [
    { name: "Starters", image: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&q=80&w=500" },
    { name: "Main Course", image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&q=80&w=500" },
    { name: "Fresh Salad / Soups / Pasta", image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=500" },
    { name: "Sandwich & Sizzlers", image: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&q=80&w=500" },
    { name: "Breakfast", image: "https://images.unsplash.com/photo-1484723091739-30a097e8f959?auto=format&fit=crop&q=80&w=500" },
    { name: "Tea/Coffee/Milk", image: "https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&q=80&w=500" },
    { name: "Juice/Shake/Lassi", image: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&q=80&w=500" },
    { name: "Dessert & Cold Stuff", image: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&q=80&w=500" },
    { name: "Whisky, Rum, Cocktails, Beer", image: "https://images.unsplash.com/photo-1569529465841-dfecdab7503b?auto=format&fit=crop&q=80&w=500" },
    { name: "Spirits & Wines", image: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=500" },
    { name: "Egg, Omelette, Toast", image: "https://images.unsplash.com/photo-1525351484163-7529414395d8?auto=format&fit=crop&q=80&w=500" },
    { name: "Maggie, Pan Cake, Momos", image: "https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?auto=format&fit=crop&q=80&w=500" },
  ];

  const categoryOrder = knownCategories.map(c => c.name);

  // Get Unique Categories (Safe Check)
  const safeMenuItems = Array.isArray(menuItems) ? menuItems : [];
  const uniqueCategories = [...new Set(safeMenuItems.map(item => item.category?.trim()))].filter(Boolean);

  // 1. Map available categories
  const availableCategories = uniqueCategories.map(catName => {
    const known = knownCategories.find(c => c.name === catName);
    const item = safeMenuItems.find(i => (i.category || "Uncategorized") === catName);
    return known || { name: catName, image: item?.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=500" };
  });

  // 2. Sort and Merge
  const allCategories = [];
  categoryOrder.forEach(targetName => {
    const found = availableCategories.find(c => c.name === targetName);
    if (found) allCategories.push(found);
  });
  availableCategories.forEach(cat => {
    if (!allCategories.find(c => c.name === cat.name)) allCategories.push(cat);
  });

  const [selectedSubCategory, setSelectedSubCategory] = useState("All");

  // Calculate SubCategories
  const subCategories = selectedCategory
    ? ["All", ...new Set(safeMenuItems.filter(i => (i.category || "Uncategorized") === selectedCategory.name && i.subCategory).map(i => i.subCategory))]
    : [];

  const filteredItems = selectedCategory
    ? safeMenuItems.filter(item =>
      (item.category || "Uncategorized") === selectedCategory.name &&
      (selectedSubCategory === "All" || item.subCategory === selectedSubCategory) &&
      (item.name || "").toLowerCase().includes(search.toLowerCase())
    )
    : (search.length > 0
      ? safeMenuItems.filter(item => (item.name || "").toLowerCase().includes(search.toLowerCase()))
      : []);

  return (
    <PageWrapper>
      <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-100px)] print:hidden">

        {/* === LEFT PANEL: POS TERMINAL === */}
        <div className="flex-1 flex flex-col gap-6 h-full">
          {/* 1. Header & Quick Inputs */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-4 rounded-2xl sm:rounded-3xl border border-gray-100 shadow-sm shrink-0 gap-4 sm:gap-0">
            <div>
              <h1 className="text-xl font-bold text-gray-800">Billing Terminal</h1>
              <p className="text-xs text-gray-400">POS • Cinnamon Agonda</p>
            </div>
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => clearCart()}
                className="p-3 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition-colors shrink-0"
                title="Clear Bill"
              >
                <Trash2 size={18} />
              </button>
              <div className="hidden sm:block h-10 w-[1px] bg-gray-200 mx-2"></div>

              <div className="flex-1 sm:flex-none flex items-center gap-2 bg-gray-50 px-3 sm:px-4 py-2 rounded-xl border border-gray-100">
                <User size={16} className="text-gray-400 shrink-0" />
                <input
                  className="bg-transparent outline-none text-sm font-bold w-full sm:w-32 placeholder:text-gray-300"
                  placeholder="Customer Name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
              </div>

              <div className="w-24 sm:w-auto flex items-center gap-2 bg-gray-50 px-3 sm:px-4 py-2 rounded-xl border border-gray-100">
                <ReceiptIcon size={16} className="text-gray-400 shrink-0" />
                <input
                  className="bg-transparent outline-none text-sm font-bold w-full sm:w-16 placeholder:text-gray-300"
                  placeholder="Table"
                  value={manualTable}
                  onChange={(e) => !isTakeaway && setManualTable(e.target.value)}
                  readOnly={isTakeaway}
                />
              </div>
            </div>
          </div>

          {/* 2. Menu Area (Categories or Items) */}
          <div className="bg-white flex-1 rounded-[2rem] border border-gray-100 shadow-sm p-6 flex flex-col min-h-0 relative overflow-hidden">
            {/* Global Search Bar */}
            <div className="relative mb-6 shrink-0 flex gap-4">
              {(selectedCategory || search) && (
                <button
                  onClick={() => { setSelectedCategory(null); setSelectedSubCategory("All"); setSearch(""); }}
                  className="flex-none px-4 py-3 rounded-xl bg-black text-white font-bold text-sm flex items-center gap-2 hover:bg-gray-800 transition-colors"
                >
                  <ArrowLeft size={16} /> Back
                </button>
              )}
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 pl-12 pr-4 font-bold outline-none focus:ring-2 focus:ring-black/5 transition-all"
                  placeholder={selectedCategory ? `Search in ${selectedCategory.name}...` : "Search for any item..."}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            <h2 className="text-lg font-bold text-gray-800 mb-4 shrink-0">
              {selectedCategory ? selectedCategory.name : "Select Category"}
            </h2>

            {/* Sub-Category Pills */}
            {selectedCategory && (
              <div className="flex flex-col gap-4 mb-4">
                {subCategories.length > 0 && (
                  <div className="flex overflow-x-auto pb-2 gap-2 scrollbar-hide">
                    {subCategories.map(sub => (
                      <button
                        key={sub}
                        onClick={() => setSelectedSubCategory(sub)}
                        className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${selectedSubCategory === sub
                          ? "bg-black text-white border-black shadow-md"
                          : "bg-white text-gray-500 border-gray-100 hover:border-gray-200 hover:bg-gray-50"
                          }`}
                      >
                        {sub}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="overflow-y-auto pr-2 custom-scrollbar">
              {!selectedCategory && search === "" ? (
                /* === CATEGORIES GRID === */
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                  {allCategories.map(cat => (
                    <button
                      key={cat.name}
                      onClick={() => { setSelectedCategory(cat); setSelectedSubCategory("All"); setSearch(""); }}
                      className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-gray-50 border border-transparent hover:border-gray-200 hover:bg-white hover:shadow-lg transition-all group"
                    >
                      <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-white shadow-sm group-hover:scale-110 transition-transform">
                        <img src={cat.image} className="w-full h-full object-cover" onError={(e) => e.target.src = "https://placehold.co/100"} />
                      </div>
                      <span className="font-bold text-gray-800 text-center text-sm leading-tight">{cat.name}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredItems.map(item => {
                    const itemId = item._id || item.id;
                    const qty = cart[itemId]?.qty || 0;
                    return (
                      <div key={itemId} className="bg-white rounded-2xl p-3 flex gap-3 shadow-sm border border-gray-100 hover:border-gray-200 transition-all">
                        {/* Image */}
                        <div className="w-24 h-24 flex-shrink-0 bg-gray-100 rounded-xl overflow-hidden relative">
                          <img src={item.image} className="w-full h-full object-cover" onError={(e) => e.target.src = "https://placehold.co/100"} />
                          <div className="absolute top-1 left-1 bg-white/90 p-[2px] rounded-sm">
                            <div className={`w-3 h-3 border ${item.veg ? "border-green-600" : "border-red-600"} flex items-center justify-center`}>
                              <div className={`w-1.5 h-1.5 ${item.veg ? "bg-green-600" : "bg-red-600"} rounded-full`}></div>
                            </div>
                          </div>
                        </div>

                        {/* Details */}
                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <h3 className="text-sm font-bold text-gray-900 leading-tight">{item.name}</h3>
                            <p className="text-[10px] text-gray-500 mt-1 line-clamp-1">{item.description || item.subCategory || item.category}</p>
                          </div>

                          <div className="flex justify-between items-center mt-2">
                            <span className="text-base font-bold text-gray-900">₹{item.price}</span>

                            {qty === 0 ? (
                              <button
                                onClick={() => addItem({ ...item, _id: itemId })}
                                className="bg-gray-50 text-black border border-gray-200 text-xs font-bold px-6 py-2 rounded-lg active:scale-95 transition hover:bg-gray-100 uppercase tracking-wide"
                              >
                                ADD
                              </button>
                            ) : (
                              <div className="flex items-center bg-black text-white rounded-lg h-[32px] px-2 shadow-sm">
                                <button onClick={() => removeItem({ ...item, _id: itemId })} className="w-8 h-full flex items-center justify-center font-bold pb-0.5 hover:bg-white/10 rounded">-</button>
                                <span className="px-2 text-sm font-bold min-w-[20px] text-center">{qty}</span>
                                <button onClick={() => addItem({ ...item, _id: itemId })} className="w-8 h-full flex items-center justify-center font-bold pb-0.5 hover:bg-white/10 rounded">+</button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {filteredItems.length === 0 && (
                    <div className="text-center py-10 text-gray-400">No items found in this category.</div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* === RIGHT PANEL: LIVE RECEIPT === */}
        <div className="w-full lg:w-[400px] xl:w-[450px] shrink-0 flex flex-col h-full">
          <div className="bg-white rounded-[2rem] border border-gray-200 shadow-xl flex-1 flex flex-col overflow-hidden relative">
            {/* Receipt Top */}
            <div className={`bg-gray-50 p-6 border-b border-gray-100 text-center relative ${isPaymentVerified ? 'bg-green-50' : ''}`}>
              <div className={`absolute top-0 left-0 w-full h-1 ${isPaymentVerified ? 'bg-green-500' : 'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500'}`}></div>
              <h2 className="font-black text-xl uppercase tracking-widest text-gray-900">RESTAURANT</h2>
              <p className="text-[10px] text-gray-400 font-mono mt-1">CINNAMON AGONDA • GOA</p>

              {isPaymentVerified && (
                <div className="inline-block mt-2 px-3 py-1 bg-green-200 text-green-800 text-xs font-bold rounded-full border border-green-300">
                  PAID VIA {paymentMethod?.toUpperCase()}
                </div>
              )}

              <div className="mt-4 flex justify-between text-xs font-bold text-gray-500 border-y border-dashed border-gray-200 py-2">
                <span>{new Date().toLocaleDateString()}</span>
                <span>{manualTable || "NO TABLE"}</span>
              </div>
            </div>

            {/* Receipt Items (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar bg-white">
              {orderItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-300 opacity-50">
                  <ReceiptIcon size={48} className="mb-2" />
                  <span className="text-xs font-bold uppercase">Bill Empty</span>
                </div>
              ) : (
                orderItems.map((item) => {
                  const discountedPrice = activeOffer ? item.price - (item.price * (activeOffer.discount / 100)) : item.price;
                  return (
                    <div key={item._id} className="flex justify-between items-center group py-2 border-b border-gray-50 hover:bg-gray-50 rounded-lg px-2 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
                          <button onClick={() => removeItem(item)} className="w-5 h-5 flex items-center justify-center bg-white rounded text-gray-600 shadow-sm hover:text-red-500 hover:scale-110 transition-all">
                            <Minus size={10} />
                          </button>
                          <span className="text-[10px] font-bold w-4 text-center">{item.qty}</span>
                          <button onClick={() => addItem(item)} className="w-5 h-5 flex items-center justify-center bg-black text-white rounded shadow-sm hover:scale-110 transition-all">
                            <Plus size={10} />
                          </button>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-gray-800">{item.name}</span>
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] ${activeOffer ? 'text-gray-400 line-through' : 'text-gray-400'}`}>₹{item.price}</span>
                            {activeOffer && (
                              <span className="text-[10px] text-green-600 font-bold">₹{discountedPrice.toFixed(0)}</span>
                            )}
                          </div>
                          {activeOffer && (
                            <span className="text-[8px] text-green-500 font-bold uppercase tracking-wider mt-0.5 flex items-center gap-1">
                              <Tag size={8} /> {activeOffer.title} Applied
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-right">
                        <div className="flex flex-col items-end">
                          <span className="font-bold text-sm text-gray-900">₹{(discountedPrice * item.qty).toFixed(2)}</span>
                          {activeOffer && (
                            <span className="text-[10px] text-gray-400 line-through">₹{item.price * item.qty}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Receipt Bottom (Totals & Actions) */}
            <div className="bg-gray-50 p-6 border-t border-gray-100 z-10">
              <div className="space-y-2 mb-4 text-sm">
                <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>₹{subtotal}</span></div>
                <div className="flex justify-between text-gray-500"><span>Tax (5%)</span><span>₹{tax}</span></div>
                {totalSavings > 0 && (
                  <div className="flex justify-between text-green-600 font-bold bg-green-50 px-2 py-1 rounded-lg border border-green-100 italic">
                    <span>Your Total Savings</span>
                    <span>-₹{totalSavings.toFixed(0)}</span>
                  </div>
                )}
                <div className="flex justify-between text-xl font-black text-gray-900 mt-2 pt-2 border-t border-gray-200">
                  <span>Total</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
              </div>

              {/* OFFER SELECTION */}
              <div className="mb-4">
                {activeOffer ? (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex justify-between items-center">
                    <div className="flex-1">
                      <p className="text-xs font-bold text-green-800 flex items-center gap-1">
                        <Tag size={12} /> {activeOffer.title} Applied
                      </p>
                      <p className="text-[10px] text-green-600 leading-tight mt-0.5">
                        {activeOffer.description || `${activeOffer.discount}% OFF on all items`}
                      </p>
                    </div>
                    <button onClick={deactivateOffer} className="text-green-700 hover:text-red-600 font-bold text-xs p-1">
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    <button
                      onClick={() => setShowOfferModal(!showOfferModal)}
                      className="w-full py-2 bg-orange-50 text-orange-600 border border-orange-100 rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-orange-100 transition-colors"
                    >
                      <Tag size={14} /> Apply Offer / Discount
                    </button>

                    {/* Dropdown for Offers */}
                    {showOfferModal && (
                      <div className="absolute bottom-full left-0 w-full mb-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-20">
                        <div className="p-2 bg-gray-50 border-b border-gray-100 font-bold text-xs text-gray-500">Available Offers</div>
                        <div className="max-h-48 overflow-y-auto">
                          {availableOffers.length > 0 ? availableOffers.map(offer => (
                            <button
                              key={offer._id}
                              onClick={() => { activateOffer(offer); setShowOfferModal(false); }}
                              className="w-full text-left p-3 hover:bg-orange-50 transition-colors border-b border-gray-50 last:border-0"
                            >
                              <p className="text-xs font-bold text-gray-800">{offer.title}</p>
                              <p className="text-[10px] text-gray-500">{offer.discount}% OFF on Menu</p>
                            </button>
                          )) : (
                            <div className="p-4 text-center text-xs text-gray-400">No Active Offers</div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* PAYMENT ACTIONS */}
              {!isPaymentVerified ? (
                <div className="space-y-3">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest text-center">Select Payment Mode</p>

                  <button
                    onClick={handleOnlinePayment}
                    className="w-full py-3.5 bg-black text-white rounded-xl font-bold hover:bg-gray-900 shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <CreditCard size={18} /> Pay via QR / Online
                  </button>

                  <div className="grid grid-cols-3 gap-2">
                    <button onClick={() => handleManualPayment('cash')} className="py-2.5 rounded-lg border border-gray-200 bg-white font-bold text-xs hover:bg-green-50 hover:text-green-600 hover:border-green-200 transition-all">
                      CASH
                    </button>
                    <button onClick={() => handleManualPayment('card')} className="py-2.5 rounded-lg border border-gray-200 bg-white font-bold text-xs hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all">
                      CARD
                    </button>
                    <button onClick={() => handleManualPayment('upi')} className="py-2.5 rounded-lg border border-gray-200 bg-white font-bold text-xs hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 transition-all">
                      MANUAL UPI
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <button onClick={() => triggerPrint("kot")} className="py-3 rounded-xl bg-white border border-gray-200 font-bold text-xs hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 shadow-sm">
                    <UtensilsCrossed size={14} /> Print KOT
                  </button>
                  <button onClick={() => triggerPrint("bill")} className="py-3 rounded-xl bg-black text-white font-bold text-xs hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 shadow-lg">
                    <Printer size={14} /> Print Bill
                  </button>
                  <button onClick={() => {
                    clearCart();
                    setCustomerName("");
                    setCustomerEmail("");
                    setExistingOrderId(null);
                    setPaymentVerified(false);
                    setPaymentMethod(null);
                    if (!isTakeaway) setManualTable("");
                    toast.success("Ready for next order");
                  }} className="col-span-2 py-3 rounded-xl border border-dashed border-gray-300 text-gray-400 font-bold text-xs hover:bg-gray-50 hover:text-gray-600 hover:border-gray-400 transition-all">
                    Start New Order
                  </button>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>

      {/* ================= PRINT TEMPLATES ================= */}
      <style>{`
        @media print {
          @page { 
            size: ${printMode === 'kot' ? '58mm' : '80mm'} auto; 
            margin: 0mm; 
          }
          html, body {
            width: ${printMode === 'kot' ? '58mm' : '80mm'} !important;
            min-width: ${printMode === 'kot' ? '58mm' : '80mm'} !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: visible !important;
          }
          .printable-content {
            width: ${printMode === 'kot' ? '48mm' : '72mm'} !important;
            margin: 0 auto !important; /* Center the printable area */
            padding: 0 !important;
          }
          /* Specific visual overrides */
          .print-kot { width: 100% !important; }
          .print-bill { width: 100% !important; }
        }
      `}</style>

      {/* KOT TEMPLATE */}
      <div className={`printable-content print-kot text-black font-mono text-[10px] hidden ${printMode === 'kot' ? 'print:!block' : 'print:hidden'} mx-auto`}>
        <div className="text-center border-b border-black pb-2 mb-2">
          <h1 className="text-sm font-bold uppercase tracking-widest">KOT - ORDER</h1>
          <p>Table: {manualTable || "N/A"}</p>
        </div>
        <div className="flex justify-between border-b border-black border-dashed pb-1 mb-2">
          <span>#{Math.floor(Math.random() * 1000)}</span>
          <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
        <table className="w-full text-left">
          <thead><tr className="border-b border-black"><th className="py-1">QTY</th><th className="py-1">ITEM</th></tr></thead>
          <tbody>{orderItems.map((it, i) => (<tr key={i}><td className="py-1 font-bold">{it.qty}</td><td className="py-1 uppercase">{it.name}</td></tr>))}</tbody>
        </table>
        <div className="text-center mt-4 pt-4 border-t border-black border-dashed font-bold italic">
          Chef Verification Needed
        </div>
      </div>

      {/* FULL BILL TEMPLATE */}
      <div className={`printable-content print-bill text-black p-4 hidden ${printMode === 'bill' ? 'print:!block' : 'print:hidden'} mx-auto`}>
        <div className="text-center mb-6">
          <h1 className="text-3xl font-black uppercase tracking-widest text-[#222]">CINNAMON AGONDA</h1>
          <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-tighter">Premier Beachfront Dining • Agonda, Goa</p>
          <div className="flex justify-center gap-4 mt-3 text-[10px] font-mono border-y border-black/10 py-2"><span>GSTIN: 30ABCDE1234F1Z1</span><span>FSSAI: 12345678901234</span></div>
        </div>
        <div className="flex justify-between text-[11px] font-mono mb-4 border-b border-black pb-3">
          <div><p>DATE: {new Date().toLocaleDateString()}</p><p>TIME: {new Date().toLocaleTimeString()}</p></div>
          <div className="text-right"><p>BILL: #{Math.floor(Math.random() * 99999)}</p><p>TABLE: {manualTable}</p></div>
        </div>
        <div className="mb-4 bg-gray-50 p-2 border-l-4 border-black">
          {customerName && <p className="text-[11px] font-mono"><span className="font-bold uppercase tracking-tight">GUEST:</span> {customerName}</p>}
          {customerEmail && <p className="text-[11px] font-mono italic mt-1 px-4">{customerEmail}</p>}
        </div>
        <table className="w-full text-[11px] font-mono mb-6">
          <thead>
            <tr className="border-b-2 border-black">
              <th className="text-left pb-2 uppercase italic font-black">Item</th>
              <th className="text-center pb-2 uppercase italic font-black">Qty</th>
              <th className="text-right pb-2 uppercase italic font-black">Amt</th>
            </tr>
          </thead>
          <tbody className="pt-2">
            {orderItems.map((item, i) => (
              <tr key={i} className="border-b border-gray-100 border-dashed">
                <td className="py-2 pr-2 font-bold uppercase">{item.name}</td>
                <td className="text-center py-2">{item.qty}</td>
                <td className="text-right py-2">{item.price.toFixed(2)}</td>
                <td className="text-right py-2 font-black">{(item.qty * item.price).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="border-t-2 border-black pt-4 space-y-2 text-[11px] font-mono">
          <div className="flex justify-between"><span className="font-bold">SUBTOTAL</span><span>{subtotal.toFixed(2)}</span></div>
          <div className="flex justify-between"><span className="font-bold">TAX (5%)</span><span>{tax.toFixed(2)}</span></div>
          <div className="flex justify-between text-xl mt-4 pt-4 border-t-2 border-black font-black"><span>TOTAL</span><span>₹ {total.toFixed(2)}</span></div>
        </div>
        <div className="text-center mt-12 pt-6 border-t border-black border-dashed">
          <p className="text-sm font-black uppercase tracking-[0.2em]">THANK YOU</p>
          <p className="text-[9px] font-mono mt-2 text-gray-400">Please pay via QR at the desk for digital invoice.</p>
          <p className="text-[9px] font-mono font-bold mt-1 text-black">POWERED BY RESTRO POS • CINNAMON AGONDA</p>
        </div>
      </div>
    </PageWrapper >
  );
}
