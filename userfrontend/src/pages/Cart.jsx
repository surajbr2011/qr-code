import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import PageWrapper from "../components/PageWrapper";
import { FiArrowLeft, FiBell, FiTrash2 } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import BottomNav from "../components/BottomNav";
import PaginationDots from "../components/PaginationDots";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-hot-toast";
import { useTheme } from "../context/ThemeContext";

/* NEW COMPONENTS (LOGIC ONLY) */
import NotificationSheet from "../components/NotificationSheet";
import EmptyCart from "../components/EmptyCart";
import PromoCode from "../components/PromoCode";
import { foods } from "../data/foods";

export default function Cart() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { cartItems, addToCart, increaseQty, decreaseQty, clearCart, activeOffer } = useCart();
    const { theme, isAvengerMode } = useTheme();

    /* ---------- STATE ---------- */
    const [promoData, setPromoData] = useState({ code: "", amount: 0 });
    const [loading, setLoading] = useState(false);
    const [autoCode, setAutoCode] = useState(null);
    const [recommendedItems, setRecommendedItems] = useState(foods); // Default to static, replace with API

    useEffect(() => {
        const code = sessionStorage.getItem("autoApplyPromo");
        if (code) setAutoCode(code);
    }, []);

    // Fetch dynamic recommendations from Backend so Admin changes reflect here
    useEffect(() => {
        const fetchRecommendations = async () => {
            try {
                const { data } = await api.get('/menu');
                if (data && data.length > 0) {
                    setRecommendedItems(data);
                }
            } catch (err) {
                console.error("Failed to fetch menu for recommendations, using static fallback", err);
            }
        };
        fetchRecommendations();
    }, []);

    /* ---------- BILL (Updated for Item-Level Offer) ---------- */
    const subtotal = cartItems.reduce((sum, item) => {
        let price = item.price;
        if (activeOffer && activeOffer.discount) {
            price = item.price - (item.price * (activeOffer.discount / 100));
        }
        return sum + (price * item.qty);
    }, 0);

    const tax = subtotal * 0.1;

    // Promo Code is separate from active offer (one or the other logic should be enforced, 
    // but here we just subtract promoData amount from the already discounted subtotal if allowed)
    const total = subtotal + tax - promoData.amount;

    /* ---------- ADDON HANDLER ---------- */
    const handleAddAddon = (addon) => {
        addToCart({ ...addon, qty: 1 });
    };

    const handlePlaceOrder = async () => {
        try {
            setLoading(true);

            const scannedTable = localStorage.getItem("qr_table_id");
            const scannedRoom = localStorage.getItem("qr_room_id");
            const scannedName = localStorage.getItem("qr_location_name");

            const finalTableNo = scannedName || scannedTable || scannedRoom || user?.tableRoom || "T-01";
            console.log("Placing Order - Table Info:", { scannedName, scannedTable, scannedRoom, userTable: user?.tableRoom, finalTableNo });

            const orderData = {
                tableNo: finalTableNo,
                items: cartItems.map(item => ({
                    menuItem: String(item._id || item.id),
                    name: item.name,
                    qty: item.qty, // Fixed: Backend expects 'qty', not 'quantity'
                    price: item.price
                })),
                totalAmount: total,
                promoCode: promoData.code,
                discountAmount: promoData.amount,
                customerInfo: {
                    name: user?.name || "Guest",
                    phone: user?.phone || ""
                }
            };

            const { data } = await api.post('/orders', orderData);

            toast.success("Order Placed! You can pay later via the Bill tab.");
            clearCart();
            // Redirect to tracking instead of payment
            navigate("/order-tracking", { state: { orderId: data._id } });

        } catch (err) {
            console.error("Order Failed:", err);
            const errMsg = err.response?.data?.message || err.message || "Failed to place order";
            toast.error(errMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* ===== HEADER (Sticky Outside Wrapper) ===== */}
            <header className={`sticky top-0 z-50 border-b shadow-sm max-w-[430px] mx-auto transition-colors duration-500 ${theme.headerBg} ${theme.border}`}>
                <div className="px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate(-1)}
                            className="active:scale-95 transition"
                        >
                            <FiArrowLeft size={22} className={`${theme.text}`} />
                        </button>
                        <h1 className={`text-lg font-semibold ${theme.text}`}>Checkout</h1>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Clear Cart Button */}
                        {cartItems.length > 0 && (
                            <button
                                onClick={() => {
                                    if (window.confirm("Are you sure you want to clear your cart?")) {
                                        clearCart();
                                        toast.success("Cart cleared");
                                    }
                                }}
                                className={`w-8 h-8 rounded-full flex items-center justify-center active:scale-95 transition ${isAvengerMode ? 'bg-red-900/30 text-red-500' : 'bg-red-50 text-red-500'}`}
                            >
                                <FiTrash2 size={18} />
                            </button>
                        )}
                    </div>
                </div>
            </header>

            <PageWrapper className={`pb-32 min-h-screen font-sans max-w-[430px] mx-auto pt-2 transition-colors duration-500 ${theme.bg}`}>

                {/* ===== EMPTY STATE ===== */}
                {cartItems.length === 0 ? (
                    <EmptyCart />
                ) : (
                    <>


                        {/* ===== TABLE HEAD ===== */}
                        <div className={`px-4 mt-2 flex justify-between text-xs font-medium tracking-wide ${theme.textSec}`}>
                            <span>ITEMS</span>
                            <span>PRICE</span>
                        </div>

                        {/* ===== CART ITEMS ===== */}
                        <div className="px-4 mt-3 space-y-4">
                            {cartItems.map((item) => (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    whileHover={{ y: -2, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}
                                    className={`rounded-xl p-3 flex gap-3 shadow-sm border transition-colors ${theme.cardBg} ${theme.border}`}
                                >
                                    <img
                                        src={item.image}
                                        alt={item.name}
                                        className="w-20 h-20 rounded-lg object-cover"
                                    />

                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <h3 className={`text-sm font-semibold ${theme.text}`}>{item.name}</h3>
                                            <div className="flex flex-col items-end">
                                                {activeOffer && (
                                                    <span className={`text-xs line-through ${theme.textSec}`}>₹{item.price * item.qty}</span>
                                                )}
                                                <span className={`font-semibold text-sm ${activeOffer ? (isAvengerMode ? 'text-red-400' : 'text-red-600') : theme.text}`}>
                                                    ₹{
                                                        (activeOffer
                                                            ? (item.price - (item.price * activeOffer.discount / 100))
                                                            : item.price
                                                        ) * item.qty
                                                    }
                                                </span>
                                            </div>
                                        </div>

                                        <p className={`text-xs mt-1 line-clamp-2 ${theme.textSec}`}>
                                            {item.description}
                                        </p>

                                        <div className="mt-3">
                                            <div className={`inline-flex items-center rounded-full text-xs h-7 border ${isAvengerMode ? 'bg-slate-700 border-slate-600' : 'bg-gray-100 border-gray-200'}`}>
                                                <button
                                                    onClick={() => decreaseQty(item.id)}
                                                    className={`px-3 h-full flex items-center justify-center rounded-l-full transition ${isAvengerMode ? 'hover:bg-slate-600 text-white' : 'hover:bg-gray-200 text-black'}`}
                                                >
                                                    −
                                                </button>
                                                <span className={`px-2 font-medium min-w-[20px] text-center ${isAvengerMode ? 'text-white' : 'text-black'}`}>{item.qty}</span>
                                                <button
                                                    onClick={() => increaseQty(item.id)}
                                                    className={`px-3 h-full flex items-center justify-center rounded-r-full transition ${isAvengerMode ? 'hover:bg-slate-600 text-white' : 'hover:bg-gray-200 text-black'}`}
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* ===== COMPLETE YOUR MEALS ===== */}
                        <section className="px-4 mt-8">
                            <h3 className={`text-sm font-bold mb-4 ${theme.text}`}>
                                Complete Your Meal
                            </h3>

                            <div className="flex gap-3 overflow-x-auto no-scrollbar snap-x pb-4">
                                {recommendedItems
                                    .filter(f =>
                                        // Suggest Drinks, Breads, or Starters
                                        ["Juice/Shake/Lassi", "Tea/Coffee/Milk", "Starters", "Dessert & Cold Stuff"].includes(f.category) ||
                                        f.subCategory === "Bread"
                                    )
                                    .filter(f => !cartItems.find(c => c.id === f.id)) // Exclude items already in cart
                                    .sort(() => 0.5 - Math.random()) // Shuffle
                                    .slice(0, 6) // Take top 6
                                    .map((addon) => (
                                        <div
                                            key={addon._id || addon.id}
                                            className={`min-w-[120px] rounded-xl p-0 shadow-sm border relative snap-start overflow-hidden ${theme.cardBg} ${theme.border}`}
                                        >
                                            <div className="relative h-24">
                                                <img
                                                    src={addon.image || "https://placehold.co/200?text=No+Image"}
                                                    onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/200?text=No+Image"; }}
                                                    className="w-full h-full object-cover"
                                                />
                                                <button
                                                    onClick={() => handleAddAddon(addon)}
                                                    className={`absolute bottom-2 right-2 w-7 h-7 rounded-full text-sm flex items-center justify-center shadow-lg active:scale-90 transition ${isAvengerMode ? 'bg-red-600 text-white' : 'bg-orange-500 text-white'}`}
                                                >
                                                    +
                                                </button>
                                            </div>
                                            <div className="p-2">
                                                <p className={`text-xs font-semibold truncate ${theme.text}`}>{addon.name}</p>
                                                <p className={`text-xs font-medium ${theme.textSec}`}>₹{addon.price}</p>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </section>

                        {/* ===== PROMO CODE ===== */}
                        {!activeOffer && (
                            <section className="px-4 mt-2">
                                <PromoCode
                                    subtotal={subtotal}
                                    onApply={(amount, code) => setPromoData({ amount, code })}
                                    autoCode={autoCode}
                                />
                            </section>
                        )}

                        {activeOffer && (
                            <div className="px-4 mt-2">
                                <div className={`border rounded-xl p-3 flex justify-between items-center text-sm font-medium ${isAvengerMode ? 'bg-red-900/20 border-red-800 text-red-300' : 'bg-red-50 border-red-100 text-red-700'}`}>
                                    <div className="flex flex-col">
                                        <span>Offer Applied: {activeOffer.title}</span>
                                        <span className={`text-xs font-normal ${isAvengerMode ? 'text-red-400' : 'text-red-500'}`}>Prices updated in menu & cart</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className={`text-xs px-2 py-1 rounded-lg ${isAvengerMode ? 'bg-red-700 text-white' : 'bg-red-500 text-white'}`}>{activeOffer.discount}% OFF</span>
                                        <button
                                            onClick={() => {
                                                if (window.confirm("Remove this offer and revert to normal prices?")) {
                                                    deactivateOffer();
                                                    toast.success("Offer removed");
                                                }
                                            }}
                                            className={`w-6 h-6 flex items-center justify-center rounded-full transition ${isAvengerMode ? 'bg-slate-800 border-red-800 text-red-400 hover:bg-slate-700' : 'bg-white border-red-200 text-red-500 hover:bg-red-100'}`}
                                        >
                                            ✕
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ===== BILL SUMMARY ===== */}
                        <section className="px-4 mt-4 mb-4">
                            <div className={`rounded-xl border p-4 text-sm space-y-3 shadow-sm ${theme.cardBg} ${theme.border}`}>
                                <div className={`flex justify-between ${theme.textSec}`}>
                                    <span>Subtotal ({cartItems.length})</span>
                                    <span className={`font-medium ${theme.text}`}>₹{subtotal.toFixed(2)}</span>
                                </div>
                                <div className={`flex justify-between ${theme.textSec}`}>
                                    <span>Taxes (10%)</span>
                                    <span className={`font-medium ${theme.text}`}>₹{tax.toFixed(2)}</span>
                                </div>
                                {promoData.amount > 0 && (
                                    <div className="flex justify-between text-green-600 font-medium">
                                        <span>Promo Applied ({promoData.code})</span>
                                        <span>-₹{promoData.amount}</span>
                                    </div>
                                )}
                                <div className={`h-px my-2 ${isAvengerMode ? 'bg-slate-700' : 'bg-gray-100'}`}></div>
                                <div className={`flex justify-between font-bold text-base ${theme.text}`}>
                                    <span>Total</span>
                                    <span>₹{total.toFixed(2)}</span>
                                </div>
                            </div>
                        </section>

                    </>
                )}

                {/* ===== PLACE ORDER (Fixed Bottom) ===== */}
                {cartItems.length > 0 && (
                    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 w-full max-w-[380px] px-4 z-[60]">
                        <motion.button
                            onClick={handlePlaceOrder}
                            disabled={loading}
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            whileTap={{ scale: 0.95 }}
                            transition={{ type: "spring", stiffness: 400, damping: 25 }}
                            className={`w-full h-16 rounded-2xl flex items-center justify-between px-6 shadow-2xl relative overflow-hidden group border border-white/20 backdrop-blur-md
                                ${loading
                                    ? 'bg-gray-400 cursor-not-allowed text-white'
                                    : (isAvengerMode
                                        ? 'bg-gradient-to-r from-red-700 via-red-600 to-yellow-500 text-white shadow-red-500/40'
                                        : 'bg-gradient-to-r from-orange-500 via-orange-600 to-red-500 text-white shadow-orange-500/40')
                                }`}
                        >
                            {/* Shimmer Effect */}
                            {!loading && (
                                <motion.div
                                    initial={{ x: "-100%" }}
                                    animate={{ x: "100%" }}
                                    transition={{ repeat: Infinity, duration: 2, repeatDelay: 3, ease: "linear" }}
                                    className="absolute inset-0 bg-white/20 -skew-x-12 w-1/2 blur-2xl"
                                />
                            )}

                            <div className="flex flex-col items-start leading-tight relative z-10">
                                <span className={`text-[10px] font-bold uppercase tracking-widest ${isAvengerMode ? 'text-yellow-200' : 'text-orange-100'}`}>
                                    Total Payable
                                </span>
                                <span className="font-extrabold text-xl font-mono">
                                    ₹{total.toFixed(0)}
                                </span>
                            </div>

                            <div className="flex items-center gap-3 relative z-10">
                                <span className="font-bold text-lg tracking-wide drop-shadow-sm">
                                    {loading ? "Ordering..." : "Place Order"}
                                </span>
                                {!loading && (
                                    <div className="">
                                        <motion.span
                                            animate={{ x: [0, 5, 0] }}
                                            transition={{ repeat: Infinity, duration: 1.5, repeatDelay: 1 }}
                                            className="text-lg block"
                                        >
                                            ➜
                                        </motion.span>
                                    </div>
                                )}
                            </div>
                        </motion.button>
                    </div>
                )}

                <BottomNav />
            </PageWrapper>
        </>
    );
}
