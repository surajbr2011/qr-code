import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import PageWrapper from "../../components/PageWrapper";
import { useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useOrders } from "../../context/OrderContext";
import { FiMinus, FiPlus, FiChevronLeft, FiBell, FiChevronRight, FiCheckCircle, FiCheck, FiTrash2 } from "react-icons/fi";
import api from "../../utils/api";
import PromoCode from "../../components/PromoCode";
import toast from "react-hot-toast";

export default function Cart() {
    const navigate = useNavigate();
    const location = useLocation();
    const { cartItems, addToCart, increaseQty, decreaseQty, clearCart } = useCart();
    const { addOrder } = useOrders();
    const [orderPlaced, setOrderPlaced] = useState(false);
    const [discount, setDiscount] = useState(0);
    const [upsellItems, setUpsellItems] = useState([]);

    // Fetch some items for upsell
    useEffect(() => {
        const fetchUpsell = async () => {
            try {
                const { data } = await api.get('/menu');
                // Pick 4 random items or just the first 4
                setUpsellItems(data.slice(0, 4).map(item => ({ ...item, id: item._id })));
            } catch (err) {
                console.error("Failed to fetch upsell items", err);
            }
        };
        fetchUpsell();
    }, []);

    // Veg Toggle State
    const [vegModeIndex, setVegModeIndex] = useState(1); // Default "all"
    const vegMode = ["veg", "all", "nonveg"][vegModeIndex];

    const handleVegToggle = () => {
        setVegModeIndex((prev) => (prev + 1) % 3);
    };

    // Filter Items based on Toggle
    const displayedItems = cartItems.filter(item => {
        if (vegMode === 'all') return true;
        if (vegMode === 'veg') return item.veg === true;
        if (vegMode === 'nonveg') return item.veg === false;
        return true;
    });

    const totalAmount = cartItems.reduce(
        (sum, item) => sum + item.price * item.qty,
        0
    );

    const taxes = Math.round(totalAmount * 0.05);
    const finalTotal = totalAmount + taxes - discount;

    const handlePlaceOrder = () => {
        // Construct new order for backend
        const orderPayload = {
            tableNo: location.state?.tableId || location.state?.room || "Staff Ordered",
            items: cartItems.map(item => ({
                menuItem: item.id,
                name: item.name,
                price: item.price,
                qty: item.qty,
                category: item.category
            })),
            totalAmount: finalTotal,
            status: 'pending',
            paymentStatus: 'pending'
        };

        addOrder(orderPayload);
        setOrderPlaced(true);
        // toast.success is handled in OrderContext

        // Clear cart and redirect
        setTimeout(() => {
            clearCart();
            navigate("/staff/orders"); // Redirect to Dashboard
        }, 2000);
    };

    return (
        <>
            {/* Header - Moved Outside PageWrapper for Sticky Behavior */}
            <div className="bg-white px-4 py-4 flex items-center justify-between sticky top-0 z-50 shadow-sm max-w-[430px] mx-auto">
                <button onClick={() => navigate(-1)} className="p-1">
                    <FiChevronLeft size={28} className="text-black" />
                </button>
                <h1 className="text-xl font-bold text-black">Checkout</h1>

                {/* Clear Cart Button */}
                {cartItems.length > 0 && (
                    <button
                        onClick={() => {
                            if (window.confirm("Are you sure you want to clear the cart?")) {
                                clearCart();
                                toast.success("Cart cleared");
                            }
                        }}
                        className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center active:scale-90 transition-transform"
                    >
                        <FiTrash2 size={20} className="text-red-500" />
                    </button>
                )}
            </div>

            <PageWrapper className="pb-32 bg-[#F5F7FB] min-h-screen max-w-[430px] mx-auto pt-2">

                {/* Cart Items */}
                <div className="px-4 mt-2">
                    {/* HEADERS */}
                    <div className="flex justify-between text-xs font-bold text-gray-500 mb-2 px-1">
                        <span>ITEMS</span>
                        <span className="flex-1 text-center pl-10">DESCRIPTION</span>
                        <span>PRICE</span>
                    </div>

                    {cartItems.length === 0 ? (
                        <div className="text-center py-20 text-gray-400">
                            <p>Your cart is empty</p>
                            <button onClick={() => navigate("/staff/menu")} className="mt-4 text-orange-500 font-bold">
                                View Menu
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {displayedItems.map((item) => (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    whileHover={{ x: 5 }}
                                    className="flex gap-4 border-b border-gray-100 pb-6 last:border-0 relative"
                                >
                                    {/* Image */}
                                    <div className="w-24 h-24 flex-shrink-0">
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            className="w-full h-full object-cover rounded-xl shadow-sm"
                                        />
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 flex flex-col">
                                        {/* Name & Price */}
                                        <div className="flex justify-between items-start">
                                            <h3 className="font-bold text-base text-gray-900">{item.name}</h3>
                                            <span className="font-bold text-base text-black">₹{item.price * item.qty}</span>
                                        </div>

                                        {/* Description */}
                                        <p className="text-[11px] text-gray-500 mt-1 leading-relaxed line-clamp-2 pr-2">
                                            Cottage cheese cubes marinated in spices and grilled in tandoor marinated in spices and grilled in tandoor...
                                        </p>

                                        {/* Quantity Pill */}
                                        <div className="mt-3 flex items-center bg-[#D1D5DB] rounded-full h-7 px-3 w-[84px] justify-between">
                                            <button
                                                onClick={() => decreaseQty(item.id)}
                                                className="w-4 flex justify-center items-center text-lg font-bold text-black pb-1 active:scale-90 transition-transform"
                                            >
                                                −
                                            </button>
                                            <span className="text-sm font-bold text-black">{item.qty}</span>
                                            <button
                                                onClick={() => increaseQty(item.id)}
                                                className="w-4 flex justify-center items-center text-lg font-bold text-black pb-1 active:scale-90 transition-transform"
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Complete Your Meals (Upsell) */}
                {cartItems.length > 0 && upsellItems.length > 0 && (
                    <div className="mt-8 px-4">
                        <h3 className="text-base font-bold text-black mb-3">Complete Your Meals</h3>
                        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
                            {upsellItems.map((food) => (
                                <div key={food.id} className="min-w-[100px] bg-white rounded-xl border border-gray-100 pb-2 shadow-sm">
                                    <div className="relative">
                                        <img src={food.image} className="w-full h-20 object-cover rounded-t-xl" alt={food.name} />
                                        <button
                                            onClick={() => addToCart(food)}
                                            className="absolute bottom-1 right-1 w-5 h-5 bg-red-400 rounded-full text-white flex items-center justify-center text-xs font-bold shadow-md active:scale-90 transition-transform"
                                        >
                                            +
                                        </button>
                                    </div>
                                    <div className="px-2 mt-1">
                                        <p className="text-[10px] font-bold text-black leading-tight line-clamp-2 h-6">{food.name}</p>
                                        <span className="text-[10px] text-gray-500 font-medium">₹{food.price}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Promos */}
                {cartItems.length > 0 && (
                    <div className="px-4 mt-6">
                        <h3 className="text-xs font-bold text-gray-500 mb-2 uppercase">Promos</h3>
                        <PromoCode
                            subtotal={totalAmount}
                            onApply={(val) => {
                                setDiscount(val);
                                toast.success("Promo applied!");
                            }}
                        />
                    </div>
                )}

                {/* Bill Details */}
                {cartItems.length > 0 && (
                    <div className="px-4 mt-4 space-y-2">
                        <div className="flex justify-between text-black text-sm font-medium">
                            <span>Subtotal ({cartItems.length})</span>
                            <span>{totalAmount}</span>
                        </div>
                        <div className="flex justify-between text-black text-sm font-medium">
                            <span>Taxes</span>
                            <span>₹{taxes}.00</span>
                        </div>
                        {discount > 0 && (
                            <div className="flex justify-between text-green-600 text-sm font-medium">
                                <span>Promo Applied</span>
                                <span>-₹{discount}</span>
                            </div>
                        )}
                        <div className="flex justify-between items-center mt-2 pt-2">
                            <span className="text-lg font-bold text-black">Total</span>
                            <span className="text-lg font-bold text-black">₹{finalTotal}.00</span>
                        </div>
                    </div>
                )}

                {/* Spacer for BottomNav */}
                <div className="mb-6"></div>
            </PageWrapper>

            {/* Place Order Button or Success Message */}
            {cartItems.length > 0 && (
                <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-full max-w-[420px] px-4 z-[60]">
                    {!orderPlaced ? (
                        <button
                            onClick={handlePlaceOrder}
                            className="w-full bg-[#F97316] text-white py-4 rounded-xl font-bold text-base shadow-lg active:scale-[0.98] transition-transform"
                        >
                            Place order
                        </button>
                    ) : (
                        <div className="w-full bg-white border border-gray-100 rounded-[30px] p-4 flex items-center gap-4 shadow-[0_8px_30px_rgba(0,0,0,0.12)]">
                            <div className="w-10 h-10 rounded-full border-2 border-black flex items-center justify-center flex-shrink-0">
                                <FiCheck size={24} className="text-black stroke-[3px]" />
                            </div>
                            <div>
                                <h3 className="text-[#F97316] font-bold text-base">Order Placed Sucessfully</h3>
                                <p className="text-[11px] font-bold text-black">The kitchen has received your order</p>
                            </div>
                        </div>
                    )}
                </div>
            )}

        </>
    );
}
