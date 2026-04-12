import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft, Search } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useTheme } from "../context/ThemeContext";
import PageWrapper from "../components/PageWrapper";
import { foods } from "../data/foods";

export default function CategoryDetail() {
    const { categoryId } = useParams();
    const navigate = useNavigate();
    const { cartItems, addToCart, increaseQty, decreaseQty, activeOffer } = useCart();
    const { theme, isAvengerMode } = useTheme();

    // Decoding category name from URL (e.g. "Main%20Course" -> "Main Course")
    const categoryName = decodeURIComponent(categoryId);

    const [items, setItems] = useState([]);
    const [subCategories, setSubCategories] = useState([]);
    const [activeSub, setActiveSub] = useState("All");
    const [vegFilter, setVegFilter] = useState("all"); // 'all', 'veg', 'non-veg'
    const [search, setSearch] = useState("");

    useEffect(() => {
        // Filter foods by category
        const categoryFoods = foods.filter(f => f.category === categoryName);
        setItems(categoryFoods);

        // Extract unique subcategories (exclude special filters to avoid duplicates)
        const subs = [...new Set(categoryFoods
            .map(f => f.subCategory)
            .filter(s => s && !["All"].includes(s))
        )];
        // Add "All" explicitly, but NO Veg/Non-Veg here
        setSubCategories(["All", ...subs]);

        // Default active to "All"
    }, [categoryName]);

    const filteredItems = items.filter(item => {
        const searchMatch = item.name.toLowerCase().includes(search.toLowerCase());

        // Subcategory Filter
        const subMatch = activeSub === "All" || item.subCategory === activeSub;

        // Veg/Non-Veg Filter
        let typeMatch = true;
        if (vegFilter === "veg") {
            typeMatch = item.veg === true;
        } else if (vegFilter === "non-veg") {
            typeMatch = item.veg === false;
        }

        return searchMatch && subMatch && typeMatch;
    });

    // Group items by subcategory for "All" view
    const groupedItems = activeSub === "All"
        ? subCategories.filter(s => s !== "All").map(sub => ({
            name: sub,
            items: filteredItems.filter(i => i.subCategory === sub)
        })).filter(g => g.items.length > 0)
        : [{ name: activeSub, items: filteredItems }];

    const totalAmount = cartItems.reduce((sum, i) => {
        let price = i.price;
        if (activeOffer && activeOffer.discount) {
            price = i.price - (i.price * (activeOffer.discount / 100));
        }
        return sum + (price * i.qty);
    }, 0);

    return (
        <>
            <PageWrapper className={`min-h-screen pb-32 max-w-[430px] mx-auto shadow-2xl transition-colors duration-500 ${theme.bg}`}>
                {/* HEADER */}
                <div className={`sticky top-0 z-30 shadow-sm pb-1 backdrop-blur-md transition-all duration-500 ${theme.headerBg} border-b ${theme.border}`}>
                    <div className="px-4 py-3 flex items-center gap-3">
                        <button onClick={() => navigate(-1)} className={`p-1 -ml-2 ${theme.textSec} hover:${theme.text}`}>
                            <ChevronLeft size={28} />
                        </button>
                        <h1 className={`text-xl font-bold truncate flex-1 ${theme.text}`}>{categoryName}</h1>
                        <div className="w-8" />
                    </div>

                    {/* KEY CHANGE: Search & Veg Toggle Row */}
                    <div className="px-4 pb-3 space-y-3">
                        {/* Search */}
                        <div className={`${theme.searchBg} rounded-xl px-4 py-2.5 flex items-center ring-1 ring-transparent focus-within:ring-2 ${isAvengerMode ? 'focus-within:ring-red-500/50' : 'focus-within:ring-orange-500/50'}`}>
                            <Search className={`${theme.textSec} mr-2`} size={18} />
                            <input
                                className={`bg-transparent w-full outline-none text-sm ${theme.inputColor} placeholder:text-gray-500`}
                                placeholder="Search in this category..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </div>

                        {/* Veg/Non-Veg Toggle */}
                        {![
                            "Whisky, Rum, Cocktails, Beer",
                            "Spirits & Wines",
                            "Tea/Coffee/Milk",
                            "Juice/Shake/Lassi"
                        ].includes(categoryName) && (
                                <div className={`flex p-1 rounded-lg ${isAvengerMode ? 'bg-slate-800 border border-slate-700' : 'bg-gray-100'}`}>
                                    {['all', 'veg', 'non-veg'].map((type) => {
                                        const isActive = vegFilter === type;
                                        return (
                                            <button
                                                key={type}
                                                onClick={() => setVegFilter(type)}
                                                className={`relative flex-1 py-1.5 text-xs font-bold rounded-md capitalize transition-colors z-10 ${isActive ? 'text-white' : (isAvengerMode ? 'text-slate-400 hover:text-slate-200' : 'text-gray-500 hover:text-gray-700')}`}
                                            >
                                                {isActive && (
                                                    <motion.span
                                                        layoutId="activeVegFilter"
                                                        className={`absolute inset-0 rounded-md -z-10 ${isAvengerMode
                                                            ? (type === 'veg' ? 'bg-green-600 shadow-md shadow-green-900/40' : type === 'non-veg' ? 'bg-red-600 shadow-md shadow-red-900/40' : 'bg-slate-600 shadow-md')
                                                            : (type === 'veg' ? 'bg-green-500' : type === 'non-veg' ? 'bg-red-500' : 'bg-white shadow-sm text-gray-900')
                                                            }`}
                                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                                    />
                                                )}
                                                <span className="relative z-10">{type}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                    </div>

                    {/* STICKY SUB-NAV */}
                    {subCategories.length > 1 && (
                        <div className={`px-4 py-2 overflow-x-auto no-scrollbar flex gap-2 border-b ${theme.border} ${theme.headerBg}`}>
                            {subCategories.map(sub => (
                                <button
                                    key={sub}
                                    onClick={() => {
                                        setActiveSub(sub);
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                    }}
                                    className={`px-4 py-1.5 text-xs font-bold rounded-full whitespace-nowrap transition-all border
                   ${activeSub === sub
                                            ? (isAvengerMode ? "bg-red-600 text-white border-red-500 shadow-md shadow-red-500/20" : "bg-orange-500 text-white border-orange-500 shadow-md")
                                            : (isAvengerMode ? "bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50")}
                 `}
                                >
                                    {sub}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* LIST */}
                <div className="p-4 space-y-6">
                    {groupedItems.map(group => (
                        <div key={group.name} id={group.name} className="scroll-mt-40">
                            {activeSub === "All" && groupedItems.length > 1 && (
                                <h2 className={`text-lg font-bold mb-3 flex items-center gap-2 ${theme.text}`}>
                                    <span className={isAvengerMode ? "text-red-500" : "text-orange-500"}>●</span> {group.name}
                                </h2>
                            )}
                            <div className="space-y-4">
                                {group.items.map(food => (
                                    <FoodItemCard
                                        key={food.id}
                                        food={food}
                                        cartItems={cartItems}
                                        addToCart={addToCart}
                                        increaseQty={increaseQty}
                                        decreaseQty={decreaseQty}
                                        theme={theme}
                                        isAvengerMode={isAvengerMode}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}

                    {groupedItems.length === 0 && (
                        <div className={`text-center py-10 ${theme.textSec}`}>No items found</div>
                    )}
                </div>

            </PageWrapper>

            {/* CART FLOAT */}
            {
                cartItems.length > 0 && (
                    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-[400px] z-[60]">
                        <motion.button
                            initial={{ y: 50, opacity: 0, scale: 0.9 }}
                            animate={{ y: 0, opacity: 1, scale: 1 }}
                            whileTap={{ scale: 0.95 }}
                            transition={{ type: "spring", stiffness: 400, damping: 25 }}
                            onClick={() => navigate("/cart")}
                            className={`w-full h-16 rounded-2xl flex items-center justify-between px-6 shadow-2xl relative overflow-hidden group
                                ${isAvengerMode
                                    ? "bg-gradient-to-r from-red-600 via-red-700 to-slate-900 border border-red-500/30 shadow-red-500/30"
                                    : "bg-gradient-to-r from-orange-500 via-orange-600 to-red-500 border border-white/20"
                                }
                            `}
                        >
                            {/* Shimmer Effect */}
                            <motion.div
                                initial={{ x: "-100%" }}
                                animate={{ x: "100%" }}
                                transition={{ repeat: Infinity, duration: 2, repeatDelay: 3, ease: "linear" }}
                                className="absolute inset-0 bg-white/20 -skew-x-12 w-1/2 blur-2xl"
                            />

                            <div className="flex items-center gap-3 relative z-10">
                                <span className="text-2xl">🛒</span>
                                <div className="flex flex-col items-start leading-tight">
                                    <span className="text-[10px] font-bold text-white/80 uppercase tracking-widest">
                                        {cartItems.length} ITEMS ADDED
                                    </span>
                                    <span className="font-extrabold text-lg text-white drop-shadow-sm">View Cart</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 bg-black/20 px-4 py-2 rounded-xl backdrop-blur-md border border-white/10 shadow-lg relative z-10">
                                <span className="text-xl font-bold text-white tracking-tight">₹{totalAmount}</span>
                                <motion.span
                                    animate={{ x: [0, 5, 0] }}
                                    transition={{ repeat: Infinity, duration: 1.5 }}
                                    className="text-white"
                                >
                                    ➜
                                </motion.span>
                            </div>
                        </motion.button>
                    </div>
                )
            }
        </>
    );
}

// Reusable Card
function FoodItemCard({ food, cartItems, addToCart, increaseQty, decreaseQty, theme, isAvengerMode }) {
    const { activeOffer } = useCart();
    const cartItem = cartItems.find((i) => i.id === food.id);

    // Fallback theme if not passed (though it should be)
    const cardTheme = theme || { cardBg: 'bg-white', text: 'text-gray-900', textSec: 'text-gray-500', border: 'border-gray-100' };

    let displayPrice = food.price;
    let originalPrice = null;

    if (activeOffer && activeOffer.discount) {
        originalPrice = food.price;
        displayPrice = food.price - (food.price * (activeOffer.discount / 100));
    }

    return (
        <div className={`${cardTheme.cardBg} rounded-2xl p-3 flex gap-3 shadow-sm border ${cardTheme.border} relative overflow-hidden`}>
            {/* Discount Badge on Item */}
            {activeOffer && (
                <div className="absolute top-0 right-0 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-bl-lg z-10 shadow-md">
                    {activeOffer.discount}% OFF
                </div>
            )}

            <div className="w-24 h-24 flex-shrink-0 bg-gray-900/5 rounded-xl overflow-hidden relative">
                <img
                    src={food.image || "https://placehold.co/200?text=No+Image"}
                    onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/200?text=No+Image"; }}
                    className="w-full h-full object-cover"
                    alt={food.name}
                />
            </div>

            <div className="flex-1 flex flex-col justify-between">
                <div>
                    <h3 className={`text-sm font-bold leading-tight ${cardTheme.text}`}>{food.name}</h3>
                    <p className={`text-[10px] mt-1 line-clamp-2 ${cardTheme.textSec}`}>{food.description || food.subCategory}</p>
                </div>

                <div className="flex justify-between items-center mt-2">
                    <div className="flex flex-col">
                        {originalPrice && (
                            <span className="text-xs text-gray-500 line-through decoration-red-500">₹{originalPrice}</span>
                        )}
                        <span className={`text-base font-bold ${isAvengerMode ? 'text-red-500 drop-shadow-sm' : 'text-gray-900'}`}>₹{displayPrice}</span>
                    </div>

                    {!cartItem ? (
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => addToCart(food)}
                            className={`${isAvengerMode ? 'bg-slate-700 text-red-400 border-slate-600' : 'bg-orange-50 text-orange-600 border-orange-100'} border text-xs font-bold px-4 py-1.5 rounded-lg active:scale-95 transition-colors`}
                        >
                            ADD
                        </motion.button>
                    ) : (
                        <div className={`flex items-center ${isAvengerMode ? 'bg-red-600 text-white shadow-red-500/30' : 'bg-orange-500 text-white'} rounded-lg h-[28px] px-2 shadow-sm`}>
                            <button onClick={() => decreaseQty(food.id)} className="w-6 h-full flex items-center justify-center font-bold pb-0.5">-</button>
                            <span className="px-1 text-xs font-bold min-w-[16px] text-center">{cartItem.qty}</span>
                            <button onClick={() => increaseQty(food.id)} className="w-6 h-full flex items-center justify-center font-bold pb-0.5">+</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
