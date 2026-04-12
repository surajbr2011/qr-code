import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import PageWrapper from "../../components/PageWrapper";
import { useCart } from "../../context/CartContext";
import { Search, ChevronLeft } from "lucide-react";
import api from "../../utils/api";

/* CATEGORY DATA & IMAGES (Copied from User App) */
const KNOWN_IMAGES = {
    "Starters": "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&q=80&w=500",
    "Main Course": "https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&q=80&w=500",
    "Fresh Salad / Soups / Pasta": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=500",
    "Sandwich & Sizzlers": "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&q=80&w=500",
    "Breakfast": "https://images.unsplash.com/photo-1484723091739-30a097e8f959?auto=format&fit=crop&q=80&w=500",
    "Tea/Coffee/Milk": "https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&q=80&w=500",
    "Juice/Shake/Lassi": "https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&q=80&w=500",
    "Dessert & Cold Stuff": "https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&q=80&w=500",
    "Whisky, Rum, Cocktails, Beer": "https://images.unsplash.com/photo-1569529465841-dfecdab7503b?auto=format&fit=crop&q=80&w=500",
    "Spirits & Wines": "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=500",
    "Egg, Omelette, Toast": "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?auto=format&fit=crop&q=80&w=500",
    "Maggie, Pan Cake, Momos": "https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?auto=format&fit=crop&q=80&w=500",
};

const ORDER = [
    "Starters", "Main Course", "Fresh Salad / Soups / Pasta", "Sandwich & Sizzlers",
    "Maggie, Pan Cake, Momos", "Breakfast", "Egg, Omelette, Toast", "Tea/Coffee/Milk",
    "Juice/Shake/Lassi", "Dessert & Cold Stuff", "Whisky, Rum, Cocktails, Beer", "Spirits & Wines"
];

const COMBOS = [
    { id: 'c1', name: "Valentine's Special", price: 999, image: "https://images.unsplash.com/photo-1590947132387-155cc02f3212?auto=format&fit=crop&q=80&w=800", desc: "Starter + Main + Dessert" },
    { id: 'c2', name: "Family Feast", price: 1499, image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=800", desc: "Full Course Meal for 4" },
    { id: 'c3', name: "Beer & Burger", price: 599, image: "https://images.unsplash.com/photo-1623341214825-9f4f963727da?auto=format&fit=crop&q=80&w=800", desc: "Classic Combo" },
];

export default function MenuSelection() {
    const navigate = useNavigate();
    // const location = useLocation(); // Keep if needed for tableId
    const { cartItems, addToCart, increaseQty, decreaseQty } = useCart();
    const totalAmount = cartItems.reduce((sum, i) => sum + i.price * i.qty, 0);

    // Data State
    const [menuItems, setMenuItems] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    // UI State
    const [searchTerm, setSearchTerm] = useState("");
    const [filterType, setFilterType] = useState("All"); // All | Veg | Non-Veg (Main View)
    const [currentSlide, setCurrentSlide] = useState(0);

    // Category Detail State
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [subCategories, setSubCategories] = useState([]);
    const [activeSub, setActiveSub] = useState("All");
    const [detailFilterType, setDetailFilterType] = useState("All"); // All | Veg | Non-Veg (Detail View)

    // Lazy Loading State
    const [visibleCount, setVisibleCount] = useState(20);
    const loadMoreRef = useRef(null);

    // Fetch Logic
    useEffect(() => {
        const fetchMenu = async () => {
            try {
                const res = await api.get("/menu");
                // Map _id to id for consistency
                const mappedData = res.data.map(item => ({ ...item, id: item._id }));
                setMenuItems(mappedData);

                // Build Categories
                const uniqueCats = [...new Set(mappedData.map(f => f.category?.trim()))].filter(Boolean);
                const builtCats = [];

                // Add ordered known categories
                ORDER.forEach(name => {
                    if (uniqueCats.includes(name)) {
                        builtCats.push({ name, image: KNOWN_IMAGES[name] || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=500" });
                    }
                });
                // Add leftovers
                uniqueCats.forEach(name => {
                    if (!builtCats.find(c => c.name === name)) {
                        builtCats.push({ name, image: KNOWN_IMAGES[name] || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=500" });
                    }
                });
                setCategories(builtCats);
                setLoading(false);
            } catch (err) {
                console.error("Failed to fetch menu", err);
                setLoading(false);
            }
        };
        fetchMenu();
    }, []);

    // Auto Slide
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide(prev => (prev + 1) % COMBOS.length);
        }, 4000);
        return () => clearInterval(timer);
    }, []);

    // Handle Category Selection
    useEffect(() => {
        if (selectedCategory) {
            // Filter foods by category
            const categoryFoods = menuItems.filter(f => (f.category || "").trim() === selectedCategory);

            // Extract unique subcategories
            const subs = [...new Set(categoryFoods
                .map(f => f.subCategory)
                .filter(s => s && !["All"].includes(s))
            )];
            // No Veg/Non-Veg in subcategories list anymore
            setSubCategories(["All", ...subs]);
            setActiveSub("All");
            setDetailFilterType("All");
            setVisibleCount(20); // Reset scroll
        }
    }, [selectedCategory, menuItems]);


    // Filter Logic
    const filteredFoods = menuItems.filter((food) => {
        // Text Search (Global)
        const matchesSearch = food.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (food.description && food.description.toLowerCase().includes(searchTerm.toLowerCase()));

        if (!selectedCategory) {
            // MAIN VIEW FILTERS
            let matchesType = true;
            if (filterType === "Veg") matchesType = food.veg === true;
            if (filterType === "Non-Veg") matchesType = food.veg === false;
            return matchesSearch && matchesType;
        } else {
            // DETAIL VIEW FILTERS
            const matchesCategory = (food.category || "").trim() === selectedCategory;
            if (!matchesCategory) return false;

            // Subcategory Filter
            const matchesSub = activeSub === "All" || food.subCategory === activeSub;

            // Veg/Non-Veg Filter (Detail View)
            let matchesType = true;
            if (detailFilterType === "Veg") matchesType = food.veg === true;
            if (detailFilterType === "Non-Veg") matchesType = food.veg === false;

            return matchesSearch && matchesSub && matchesType;
        }
    });

    // Reset pagination when filters change
    useEffect(() => {
        setVisibleCount(20);
    }, [searchTerm, filterType, activeSub, detailFilterType]);

    // Lazy Load Observer
    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                setVisibleCount(prev => prev + 20);
            }
        }, { rootMargin: "100px" });

        if (loadMoreRef.current) observer.observe(loadMoreRef.current);

        return () => observer.disconnect();
    }, [filteredFoods]);

    const displayedFoods = filteredFoods.slice(0, visibleCount);
    const isSearching = searchTerm.length > 0;

    // Group items by subcategory for "All" view (Detail View Only)
    // Same logic as User App's CategoryDetail.jsx
    const groupedItems = !selectedCategory ? [] : (activeSub === "All"
        ? subCategories.filter(s => s !== "All").map(sub => ({
            name: sub,
            items: filteredFoods.filter(i => i.subCategory === sub)
        })).filter(g => g.items.length > 0)
        : [{ name: activeSub, items: filteredFoods }]);

    const containerVariants = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.05 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        show: { opacity: 1, y: 0 }
    };

    if (loading) return <div className="flex h-screen items-center justify-center"><div className="animate-spin h-8 w-8 border-2 border-black rounded-full border-t-transparent"></div></div>;

    return (
        <>
            {/* Page Content Wrapper - increased padding to clear floating button */}
            <PageWrapper className="pb-32 bg-gray-50 min-h-screen font-sans max-w-[430px] mx-auto shadow-2xl">

                {/* HEADER */}
                <div className="bg-white px-4 pt-4 pb-2 sticky top-0 z-20 shadow-sm space-y-3">
                    {/* Back & Search Row */}
                    <div className="flex items-center gap-3">
                        <button onClick={() => {
                            if (selectedCategory) {
                                setSelectedCategory(null);
                            } else {
                                navigate(-1);
                            }
                        }} className="p-1 -ml-1">
                            <ChevronLeft size={28} className="text-black" strokeWidth={1.5} />
                        </button>

                        {/* Title if Category Selected, else Search moves here? */}
                        {selectedCategory ? (
                            <h1 className="text-xl font-bold text-gray-900 truncate flex-1">{selectedCategory}</h1>
                        ) : (
                            <div className="bg-gray-100 rounded-xl px-4 py-2.5 flex items-center flex-1">
                                <Search size={18} className="text-gray-400 mr-2" />
                                <input
                                    placeholder="Search dishes..."
                                    className="bg-transparent text-sm w-full outline-none"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        )}
                        {/* If Category Selected, maybe search button? For now keep simple. */}
                        {selectedCategory && (
                            <div className="w-8" /> // Spacer
                        )}
                    </div>

                    {/* 3-Way Filter Toggle (Only in Main View) */}
                    {!selectedCategory && (
                        <div className="flex bg-gray-100 p-1 rounded-xl">
                            {["All", "Veg", "Non-Veg"].map(type => (
                                <button
                                    key={type}
                                    onClick={() => setFilterType(type)}
                                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all
                                ${filterType === type
                                            ? (type === 'Veg' ? 'bg-green-600 text-white shadow-sm' : type === 'Non-Veg' ? 'bg-red-600 text-white shadow-sm' : 'bg-white text-gray-900 shadow-sm')
                                            : 'text-gray-500 hover:text-gray-700'
                                        }
                                `}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* DETAIL VIEW: Veg/Non-Veg Toggle + Subcategories */}
                    {selectedCategory && (
                        <div className="space-y-3">
                            {/* Veg/Non-Veg Toggle for Detail View */}
                            <div className="flex bg-gray-100 p-1 rounded-xl">
                                {["All", "Veg", "Non-Veg"].map(type => (
                                    <button
                                        key={type}
                                        onClick={() => setDetailFilterType(type)}
                                        className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all
                                    ${detailFilterType === type
                                                ? (type === 'Veg' ? 'bg-green-600 text-white shadow-sm' : type === 'Non-Veg' ? 'bg-red-600 text-white shadow-sm' : 'bg-white text-gray-900 shadow-sm')
                                                : 'text-gray-500 hover:text-gray-700'
                                            }
                                    `}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>

                            {/* Sub-Category Pills - Hidden Scrollbar */}
                            {subCategories.length > 1 && (
                                <div className="overflow-x-auto flex gap-2 pb-1 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                                    <style>{`
                                        .scrollbar-hide::-webkit-scrollbar {
                                            display: none;
                                        }
                                    `}</style>
                                    {subCategories.map(sub => (
                                        <button
                                            key={sub}
                                            onClick={() => {
                                                setActiveSub(sub);
                                                window.scrollTo({ top: 0, behavior: 'smooth' });
                                            }}
                                            className={`px-4 py-1.5 text-xs font-bold rounded-full whitespace-nowrap transition-all border
                                            ${activeSub === sub
                                                    ? "bg-orange-500 text-white border-orange-500 shadow-md"
                                                    : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"}
                                        `}
                                        >
                                            {sub}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* CONTENT */}
                {isSearching && !selectedCategory ? (
                    /* GLOBAL SEARCH RESULTS */
                    <div className="px-4 mt-4 space-y-4 min-h-[50vh]">
                        <h2 className="font-bold text-base text-gray-700 flex justify-between items-center">
                            <span>Results ({filteredFoods.length})</span>
                        </h2>
                        {displayedFoods.map(food => (
                            <FoodItemCard
                                key={food.id}
                                food={food}
                                cartItems={cartItems}
                                addToCart={addToCart}
                                increaseQty={increaseQty}
                                decreaseQty={decreaseQty}
                            />
                        ))}
                        {/* Sentinel for infinite scroll */}
                        {displayedFoods.length < filteredFoods.length && (
                            <div ref={loadMoreRef} className="h-10 flex items-center justify-center">
                                <div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        )}
                    </div>
                ) : selectedCategory ? (
                    /* CATEGORY DETAIL VIEW (GROUPED) */
                    <div className="p-4 space-y-6 min-h-[50vh]">
                        {groupedItems.length === 0 ? (
                            <div className="text-center py-10 text-gray-400">No items found</div>
                        ) : (
                            groupedItems.map(group => (
                                <div key={group.name} id={group.name} className="scroll-mt-40">
                                    {activeSub === "All" && groupedItems.length > 1 && (
                                        <h2 className="text-lg font-bold text-gray-800 mb-3">{group.name}</h2>
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
                                            />
                                        ))}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                ) : (
                    /* MAIN MENU VIEW */
                    <>
                        {/* CAROUSEL */}
                        <div className="mt-4 px-4 overflow-hidden">
                            <div className="relative w-full h-[180px] rounded-2xl overflow-hidden shadow-lg">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={currentSlide}
                                        initial={{ opacity: 0, x: 50 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -50 }}
                                        transition={{ duration: 0.5 }}
                                        className="absolute inset-0 w-full h-full"
                                    >
                                        <img src={COMBOS[currentSlide].image} className="w-full h-full object-cover" alt="Promo" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-5 text-white">
                                            <h3 className="font-bold text-2xl leading-tight mb-1">{COMBOS[currentSlide].name}</h3>
                                            <p className="text-sm opacity-90">{COMBOS[currentSlide].desc}</p>
                                        </div>
                                    </motion.div>
                                </AnimatePresence>
                                {/* Dots */}
                                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                                    {COMBOS.map((_, idx) => (
                                        <div key={idx} className={`w-1.5 h-1.5 rounded-full transition-colors ${currentSlide === idx ? "bg-white" : "bg-white/40"}`} />
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* CATEGORY GRID */}
                        <div className="px-4 mt-8">
                            <h2 className="font-bold text-lg text-gray-900 mb-5 px-1">Main Menu</h2>
                            <motion.div
                                className="grid grid-cols-4 gap-x-2 gap-y-7"
                                variants={containerVariants}
                                initial="hidden"
                                animate="show"
                            >
                                {categories.filter(cat => {
                                    if (filterType === "All") return true;
                                    return menuItems.some(f => {
                                        const isCatMatch = (f.category || "").trim() === cat.name;
                                        if (!isCatMatch) return false;
                                        if (filterType === "Veg") return f.veg === true;
                                        if (filterType === "Non-Veg") return f.veg === false;
                                        return true;
                                    });
                                }).map(cat => (
                                    <motion.button
                                        key={cat.name}
                                        variants={itemVariants}
                                        onClick={() => {
                                            // ENTER CATEGORY MODE
                                            setSelectedCategory(cat.name);
                                            window.scrollTo({ top: 0, behavior: 'auto' });
                                        }}
                                        className="flex flex-col items-center gap-2 group w-full"
                                    >
                                        <div className="w-[72px] h-[72px] sm:w-[80px] sm:h-[80px] rounded-full overflow-hidden shadow-sm border border-gray-100 group-active:scale-95 transition-transform bg-white relative">
                                            <img src={cat.image} className="w-full h-full object-cover" alt={cat.name} />
                                        </div>
                                        <span className="text-[10px] sm:text-xs font-bold text-center text-gray-800 leading-tight px-0.5 line-clamp-2 min-h-[2.5em] w-full break-words">
                                            {cat.name}
                                        </span>
                                    </motion.button>
                                ))}
                            </motion.div>
                        </div>

                        {/* ALL DISHES LIST - LAZY LOADED */}
                        <div className="px-4 mt-8 pb-4 space-y-4" id="all-dishes">
                            <h2 className="font-bold text-lg text-gray-900 px-1">All Dishes</h2>
                            <div className="space-y-4">
                                {displayedFoods.map(food => (
                                    <FoodItemCard
                                        key={food.id}
                                        food={food}
                                        cartItems={cartItems}
                                        addToCart={addToCart}
                                        increaseQty={increaseQty}
                                        decreaseQty={decreaseQty}
                                    />
                                ))}
                                {/* Sentinel for infinite scroll */}
                                {displayedFoods.length < filteredFoods.length && (
                                    <div ref={loadMoreRef} className="h-10 flex items-center justify-center">
                                        <div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </PageWrapper>

            {/* FLOATING CART BUTTON */}
            {cartItems.length > 0 && (
                <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-[90%] max-w-[400px] z-[60]">
                    <motion.button
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        onClick={() => navigate("/staff/cart")}
                        className="w-full h-14 bg-gradient-to-r from-orange-500 to-orange-600
                        text-white rounded-2xl flex items-center justify-between
                        px-5 font-semibold shadow-2xl transition-transform active:scale-[0.98]"
                    >
                        <span>🛒 View Cart ({cartItems.length})</span>
                        <span className="text-lg font-bold">₹{totalAmount}</span>
                    </motion.button>
                </div>
            )}
        </>
    );
}

// Reusable Card Component
function FoodItemCard({ food, cartItems, addToCart, increaseQty, decreaseQty }) {
    const cartItem = cartItems.find((i) => i.id === food.id);
    return (
        <div className="bg-white rounded-2xl p-3 flex gap-3 shadow-sm border border-gray-100">
            <div className="w-24 h-24 flex-shrink-0 bg-gray-100 rounded-xl overflow-hidden relative">
                <img
                    src={food.image || "https://placehold.co/200?text=No+Image"}
                    onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/200?text=No+Image"; }}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    alt={food.name}
                />
            </div>
            <div className="flex-1 flex flex-col justify-between">
                <div>
                    <h3 className="text-sm font-bold text-gray-900 leading-tight">{food.name}</h3>
                    <p className="text-[10px] text-gray-500 mt-1 line-clamp-1">{food.description || food.subCategory || food.category}</p>
                </div>
                <div className="flex justify-between items-center mt-2">
                    <span className="text-base font-bold text-gray-900">₹{food.price}</span>
                    {!cartItem ? (
                        <button onClick={() => addToCart(food)} className="bg-orange-50 text-orange-600 border border-orange-100 text-xs font-bold px-4 py-1.5 rounded-lg active:scale-95 transition">ADD</button>
                    ) : (
                        <div className="flex items-center bg-orange-500 text-white rounded-lg h-[28px] px-2 shadow-sm">
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
