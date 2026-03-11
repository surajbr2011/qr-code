import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import PageWrapper from "../components/PageWrapper";
import BottomNav from "../components/BottomNav";
import { useCart } from "../context/CartContext";
import { useTheme } from "../context/ThemeContext";
import { Search, X, Bell, Zap, Shield } from "lucide-react"; // Zap/Shield for Avengers vibe
import NotificationSheet from "../components/NotificationSheet";
import { foods } from "../data/foods";
import socket from "../utils/socket";
import Banner from "../components/Banner";

/* CATEGORY DATA */
const KNOWN_IMAGES = {
  "Starters": "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&q=80&w=500",
  "Main Course": "https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&q=80&w=500",
  "Fresh Salad / Soups / Pasta": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=500",
  "Sandwich & Sizzlers": "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&q=80&w=500",
  "Breakfast": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=500",
  "Tea/Coffee/Milk": "https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&q=80&w=500",
  "Juice/Shake/Lassi": "https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&q=80&w=500",
  "Dessert & Cold Stuff": "https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&q=80&w=500",
  "Whisky, Rum, Cocktails, Beer": "https://images.unsplash.com/photo-1569529465841-dfecdab7503b?auto=format&fit=crop&q=80&w=500",
  "Spirits & Wines": "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=500",
  "Egg, Omelette, Toast": "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?auto=format&fit=crop&q=80&w=500",
  "Maggie, Pan Cake, Momos": "https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?auto=format&fit=crop&q=80&w=500",
};

// 1. Get unique categories from data
const uniqueCats = [...new Set(foods.map(f => f.category?.trim()))].filter(Boolean);

// 2. Define strict order
const ORDER = [
  "Starters", "Main Course", "Fresh Salad / Soups / Pasta", "Sandwich & Sizzlers",
  "Maggie, Pan Cake, Momos", "Breakfast", "Egg, Omelette, Toast", "Tea/Coffee/Milk",
  "Juice/Shake/Lassi", "Dessert & Cold Stuff", "Whisky, Rum, Cocktails, Beer", "Spirits & Wines"
];

const CATEGORIES = [];
ORDER.forEach(name => {
  if (uniqueCats.includes(name)) {
    CATEGORIES.push({ name, image: KNOWN_IMAGES[name] || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=500" });
  }
});
uniqueCats.forEach(name => {
  if (!CATEGORIES.find(c => c.name === name)) {
    CATEGORIES.push({ name, image: KNOWN_IMAGES[name] || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=500" });
  }
});

export default function Menu() {
  const navigate = useNavigate();
  const { cartItems, addToCart, increaseQty, decreaseQty, activeOffer } = useCart();
  const { isAvengerMode, toggleTheme, theme } = useTheme();

  const totalAmount = cartItems.reduce((sum, i) => {
    let price = i.price;
    if (activeOffer && activeOffer.discount) {
      price = i.price - (i.price * (activeOffer.discount / 100));
    }
    return sum + (price * i.qty);
  }, 0);

  // --- STATE ---
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("All"); // All | Veg | Non-Veg

  // --- FILTER LOGIC ---
  const filteredFoods = foods.filter((food) => {
    const matchesSearch = food.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      food.description?.toLowerCase().includes(searchTerm.toLowerCase());
    let matchesType = true;
    if (filterType === "Veg") matchesType = food.veg === true;
    if (filterType === "Non-Veg") matchesType = food.veg === false;

    return matchesSearch && matchesType;
  });

  const isSearching = searchTerm.length > 0;

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.8, y: 20 },
    show: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  const [showNotif, setShowNotif] = useState(false);
  const [hasNewOffer, setHasNewOffer] = useState(false);

  useEffect(() => {
    const handleNewOffer = (data) => {
      setHasNewOffer(true);
      try { new Audio("/sounds/notification.mp3").play(); } catch (e) { }
    };
    socket.on("offer:new", handleNewOffer);
    return () => socket.off("offer:new", handleNewOffer);
  }, []);



  return (
    <>
      <NotificationSheet
        open={showNotif}
        onClose={() => { setShowNotif(false); setHasNewOffer(false); }}
      />

      <PageWrapper className={`pb-40 min-h-screen font-sans max-w-[430px] mx-auto transition-colors duration-500 ${theme.bg}`}>

        {/* HEADER */}
        <div className={`px-4 pt-4 pb-4 sticky top-0 z-20 backdrop-blur-md transition-all duration-500 ${theme.headerBg} border-b ${theme.border}`}>

          <div className="flex items-center gap-2 mb-2">

            <div className={`${theme.searchBg} transition-colors duration-300 rounded-2xl px-3 py-2.5 flex items-center flex-grow ring-1 ring-transparent focus-within:ring-2 ${isAvengerMode ? 'focus-within:ring-red-500/50' : 'focus-within:ring-orange-500/50'}`}>
              <Search size={18} className={`${theme.textSec} mr-2 shrink-0`} />
              <input
                placeholder="Search dishes..."
                className={`bg-transparent text-sm w-full outline-none ${theme.inputColor} placeholder:text-gray-500`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm("")} className={`${theme.textSec} p-1 hover:text-red-500`}>
                  <X size={16} />
                </button>
              )}
            </div>

            {/* THEME TOGGLE */}
            <motion.button
              whileTap={{ scale: 0.9, rotate: 180 }}
              onClick={toggleTheme}
              className={`p-2.5 rounded-2xl transition-all duration-300 ${isAvengerMode ? 'bg-slate-800 text-yellow-400 border border-yellow-500/30' : 'bg-gray-100 text-gray-600'}`}
            >
              {isAvengerMode ? <Zap size={20} fill="currentColor" /> : <Zap size={20} />}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowNotif(true)}
              className={`p-2.5 rounded-2xl relative transition-all duration-300 ${isAvengerMode ? 'bg-slate-800 text-red-400 border border-red-500/20' : 'bg-gray-100 text-gray-600'}`}
            >
              <Bell size={20} />
              {hasNewOffer && (
                <span className="absolute top-2 right-2.5 w-2.5 h-2.5 bg-red-600 rounded-full border-2 border-[#0f172a] animate-ping" />
              )}
            </motion.button>
          </div>

          {/* 3-Way Filter Toggle */}
          <div className={`flex mt-4 p-1.5 rounded-2xl ${isAvengerMode ? 'bg-slate-800 border border-slate-700' : 'bg-gray-100'}`}>
            {["All", "Veg", "Non-Veg"].map((type) => {
              const isActive = filterType === type;
              return (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`relative flex-1 py-2 text-xs font-bold rounded-xl transition-colors z-10 ${isActive ? 'text-white' : (isAvengerMode ? 'text-slate-400 hover:text-slate-200' : 'text-gray-500 hover:text-gray-900')}`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="activeFilter"
                      className={`absolute inset-0 rounded-xl -z-10 ${isAvengerMode
                        ? (type === 'Veg' ? 'bg-green-600 shadow-lg shadow-green-900/40' : type === 'Non-Veg' ? 'bg-red-600 shadow-lg shadow-red-900/40' : 'bg-slate-700 border border-slate-600 shadow-lg')
                        : (type === 'Veg' ? 'bg-green-500' : type === 'Non-Veg' ? 'bg-red-500' : 'bg-orange-500')
                        }`}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">{type}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* --- VIEW SWITCHER --- */}
        <AnimatePresence mode="wait">
          {isSearching ? (
            /* === SEARCH RESULTS VIEW === */
            <motion.div
              key="search-results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="px-4 mt-6 space-y-4 min-h-[50vh]"
            >
              <h2 className={`font-bold text-base flex justify-between items-center ${theme.text}`}>
                <span>Results ({filteredFoods.length})</span>
                <span className={`text-xs font-normal ${theme.textSec}`}>Filtering: {filterType}</span>
              </h2>
              {filteredFoods.length > 0 ? (
                filteredFoods.map(food => (
                  <FoodItemCard
                    key={food.id}
                    food={food}
                    cartItems={cartItems}
                    addToCart={addToCart}
                    increaseQty={increaseQty}
                    decreaseQty={decreaseQty}
                    isAvengerMode={isAvengerMode}
                  />
                ))
              ) : (
                <div className={`text-center py-10 ${theme.textSec}`}>
                  <p>No dishes found matching "{searchTerm}"</p>
                </div>
              )}
            </motion.div>
          ) : (
            /* === MAIN MENU VIEW === */
            <motion.div
              key="main-menu"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* HERO BANNER */}
              <div className="pt-2">
                <Banner />
              </div>

              {/* CATEGORY GRID */}
              <div className="px-4 mt-8">
                <h2 className={`font-bold text-lg mb-5 px-1 flex items-center gap-2 ${theme.text}`}>
                  <span className={isAvengerMode ? "text-red-500" : "text-orange-500"}>●</span> Main Menu
                </h2>
                <motion.div
                  className="grid grid-cols-4 gap-x-3 gap-y-7"
                  variants={containerVariants}
                  initial="hidden"
                  animate="show"
                >
                  {CATEGORIES.filter(cat => {
                    if (filterType === "All") return true;
                    return foods.some(f => (f.category || "") === cat.name && (filterType === "Veg" ? f.veg : filterType === "Non-Veg" ? !f.veg : true));
                  }).map(cat => (
                    <motion.button
                      key={cat.name}
                      variants={itemVariants}
                      whileHover={{ scale: 1.05, y: -5 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => navigate(`/menu/${encodeURIComponent(cat.name)}`)}
                      className="flex flex-col items-center gap-3 group w-full"
                    >
                      <div className={`w-[72px] h-[72px] sm:w-[80px] sm:h-[80px] rounded-full overflow-hidden shadow-lg p-0.5 relative
                        ${isAvengerMode
                          ? "bg-gradient-to-br from-red-500 to-yellow-500 shadow-red-500/20"
                          : "bg-white border text-gray-100"
                        }
                    `}>
                        <div className="w-full h-full rounded-full overflow-hidden border-2 border-white/20">
                          <img src={cat.image} className="w-full h-full object-cover" alt={cat.name} />
                        </div>
                      </div>
                      <span className={`text-[10px] sm:text-xs font-bold text-center leading-tight px-0.5 line-clamp-2 min-h-[2.5em] w-full break-words ${theme.textSec} group-hover:${theme.text} transition-colors`}>
                        {cat.name}
                      </span>
                    </motion.button>
                  ))}
                </motion.div>
              </div>

              {/* ALL ITEMS LIST */}
              <div className="px-4 mt-10 pb-4 space-y-4">
                <h2 className={`font-bold text-lg px-1 flex items-center gap-2 ${theme.text}`}>
                  <span className={isAvengerMode ? "text-red-500" : "text-orange-500"}>●</span> All Dishes
                </h2>
                <div className="space-y-4">
                  {filteredFoods.map(food => (
                    <FoodItemCard
                      key={food.id}
                      food={food}
                      cartItems={cartItems}
                      addToCart={addToCart}
                      increaseQty={increaseQty}
                      decreaseQty={decreaseQty}
                      isAvengerMode={isAvengerMode}
                    />
                  ))}
                  {filteredFoods.length === 0 && (
                    <p className={`text-center py-6 ${theme.textSec}`}>No dishes found with current filter.</p>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </PageWrapper>

      {/* FOOTER */}
      <BottomNav />
      {/* CART FLOAT */}
      {cartItems.length > 0 && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 w-full max-w-[380px] px-4 z-50">
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
            {/* Shimmer */}
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
              <motion.span animate={{ x: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 1.5 }} className="text-white">➜</motion.span>
            </div>
          </motion.button>
        </div>
      )}
    </>
  );
}

// Reusable Search Result Card
function FoodItemCard({ food, cartItems, addToCart, increaseQty, decreaseQty, isAvengerMode }) {
  const { activeOffer } = useCart();
  const cartItem = cartItems.find((i) => i.id === food.id);
  const theme = isAvengerMode ? {
    card: "bg-slate-800 border-slate-700 shadow-lg shadow-black/20",
    text: "text-slate-100",
    subText: "text-slate-400",
    border: "border-slate-700",
    btnBg: "bg-slate-700 text-red-400 border-slate-600",
    counterBg: "bg-red-600 text-white shadow-red-500/30"
  } : {
    card: "bg-white border-gray-100 shadow-sm",
    text: "text-gray-900",
    subText: "text-gray-500",
    border: "border-gray-100",
    btnBg: "bg-orange-50 text-orange-600 border-orange-100",
    counterBg: "bg-orange-500 text-white"
  };

  let displayPrice = food.price;
  let originalPrice = null;
  if (activeOffer && activeOffer.discount) {
    originalPrice = food.price;
    displayPrice = food.price - (food.price * (activeOffer.discount / 100));
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`${theme.card} rounded-2xl p-3 flex gap-3 border relative overflow-hidden`}
    >
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
          <h3 className={`text-sm font-bold leading-tight ${theme.text}`}>{food.name}</h3>
          <p className={`text-[10px] mt-1 line-clamp-1 ${theme.subText}`}>{food.description || food.subCategory}</p>
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
              className={`${theme.btnBg} border text-xs font-bold px-4 py-1.5 rounded-lg active:scale-95 transition-colors`}
            >
              ADD
            </motion.button>
          ) : (
            <div className={`flex items-center ${theme.counterBg} rounded-lg h-[28px] px-2 shadow-sm`}>
              <button onClick={() => decreaseQty(food.id)} className="w-6 h-full flex items-center justify-center font-bold pb-0.5">-</button>
              <span className="px-1 text-xs font-bold min-w-[16px] text-center">{cartItem.qty}</span>
              <button onClick={() => increaseQty(food.id)} className="w-6 h-full flex items-center justify-center font-bold pb-0.5">+</button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
