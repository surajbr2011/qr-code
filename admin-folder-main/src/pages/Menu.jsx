import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import PageWrapper from "../components/layout/PageWrapper";
import MenuCard from "../components/cards/MenuCard";
import { useCart } from "../context/CartContext";
import api from "../utils/api";
import toast from "react-hot-toast";
import { ArrowLeft } from "lucide-react";

export default function Menu() {
  const location = useLocation();
  const isTakeaway = location.state?.mode === 'takeaway';
  const tableId = location.state?.tableId;
  const existingOrder = location.state?.order;
  const [category, setCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const { cart, addItem, removeItem } = useCart();
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Navigation State
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState("All");

  const navigate = () => setSelectedCategory(null); // Back handler

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const { data } = await api.get("/menu");
        setMenuItems(data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load menu");
        setLoading(false);
      }
    };
    fetchMenu();
  }, []);

  const knownCategories = [
    { name: "Starters", image: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&q=80&w=500" },
    { name: "Main Course", image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&q=80&w=500" },
    { name: "Fresh Salad / Soups / Pasta", image: "https://images.unsplash.com/photo-1547496502-ffa2264a1225?auto=format&fit=crop&q=80&w=500" },
    { name: "Sandwich & Sizzlers", image: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&q=80&w=500" },
    { name: "Breakfast", image: "https://images.unsplash.com/photo-1533089862017-54148d3132af?auto=format&fit=crop&q=80&w=500" },
    { name: "Beverages (Non-Alcohol)", image: "https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&q=80&w=500" },
    { name: "Snacks", image: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&q=80&w=500" },
    { name: "Dessert & Cold Staff", image: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&q=80&w=500" },
    { name: "Alcoholic Beverages", image: "https://images.unsplash.com/photo-1569529465841-dfecdab7503b?auto=format&fit=crop&q=80&w=500" },
    { name: "Spirits", image: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=500" },
  ];

  // Dynamically merge DB categories with known images
  const uniqueCategories = [...new Set(menuItems.map(item => item.category?.trim()))].filter(Boolean);

  const categoryOrder = [
    "Starters",
    "Main Course",
    "Fresh Salad / Soups / Pasta",
    "Sandwich & Sizzlers",
    "Breakfast",
    "Beverages (Non-Alcohol)",
    "Snacks",
    "Dessert & Cold Staff",
    "Alcoholic Beverages",
    "Spirits"
  ];

  // 1. First, map all available categories to objects
  const availableCategories = uniqueCategories.map(catName => {
    const known = knownCategories.find(c => c.name === catName);
    return known || {
      name: catName,
      image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=500" // Generic food fallback 
    };
  });

  // 2. Create the final ordered list
  const allCategories = [];

  // Add items in the specific order
  categoryOrder.forEach(targetName => {
    const found = availableCategories.find(c => c.name === targetName);
    if (found) {
      allCategories.push(found);
    }
  });

  // Add any remaining categories that weren't in the specific order
  availableCategories.forEach(cat => {
    if (!allCategories.find(c => c.name === cat.name)) {
      allCategories.push(cat);
    }
  });

  const filteredItems = menuItems.filter((item) => {
    let matchesCategory = true;
    if (selectedCategory) {
      matchesCategory = item.category?.trim() === selectedCategory.name?.trim();
    }

    let matchesSubCategory = true;
    if (selectedCategory && selectedSubCategory !== "All") {
      matchesSubCategory = item.subCategory === selectedSubCategory;
    }

    // Explicit Filter Logic
    let matchesType = true;
    if (category === "veg") matchesType = item.veg === true;
    if (category === "nonveg") matchesType = item.veg === false;
    if (category === "drinks") matchesType = ['Drinks', 'Beverages (Non-Alcohol)', 'Alcoholic Beverages', 'Spirits'].includes(item.category);

    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSubCategory && matchesType && matchesSearch;
  });

  const subCategories = selectedCategory
    ? ["All", ...new Set(menuItems.filter(i => i.category === selectedCategory.name && i.subCategory).map(i => i.subCategory))]
    : [];

  if (loading) return <div className="p-8 text-center">Loading Menu...</div>;

  return (
    <PageWrapper onSearch={setSearchQuery}>
      {selectedCategory ? (
        /* ================= DETAIL VIEW: SELECTED CATEGORY ================= */
        <div className="animate-fadeIn">
          {/* PREMIUM HEADER CARD */}
          <div className="relative bg-[#1a1a1a] text-white rounded-[2rem] p-6 mb-8 overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-end gap-6 shadow-2xl isolate">
            {/* Decorative Background */}
            <div className="absolute top-0 right-0 w-2/3 h-full opacity-30 pointer-events-none mix-blend-overlay">
              <img src={selectedCategory.image} className="w-full h-full object-cover" style={{ maskImage: 'linear-gradient(to left, black, transparent)' }} alt="" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent -z-10" />

            {/* Left Content */}
            <div className="relative z-10 space-y-2">
              <button
                onClick={() => {
                  setSelectedCategory(null);
                  setSelectedSubCategory("All");
                  setCategory("all");
                }}
                className="flex items-center gap-2 text-white/60 hover:text-white transition-colors group mb-2"
              >
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition">
                  <ArrowLeft size={16} />
                </div>
                <span className="text-sm font-medium">Back to Categories</span>
              </button>

              <h1 className="text-4xl font-bold tracking-tight text-white">{selectedCategory.name}</h1>
              <p className="text-white/50 font-mono text-sm">
                Showing {filteredItems.length} items
              </p>
            </div>

            {/* Right Controls */}
            <div className="relative z-10 flex flex-col items-end gap-3 w-full md:w-auto">
              <span className="text-xs font-bold text-white/40 uppercase tracking-widest">Filter By Type</span>
              <div className="bg-white/10 backdrop-blur-md p-1 rounded-full flex w-full md:w-auto">
                {[{ id: "all", label: "All" }, { id: "veg", label: "Veg" }, { id: "nonveg", label: "Non-Veg" }].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setCategory(cat.id)}
                    className={`flex-1 md:flex-none px-6 py-2 rounded-full text-xs font-bold transition-all ${category === cat.id
                      ? "bg-white text-black shadow-lg"
                      : "text-white hover:bg-white/10"
                      }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Sub-Category Navigation */}
          {subCategories.length > 1 && (
            <div className="flex overflow-x-auto pb-4 gap-2 mb-6 scrollbar-hide">
              {subCategories.map(sub => (
                <button
                  key={sub}
                  onClick={() => setSelectedSubCategory(sub)}
                  className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all border ${selectedSubCategory === sub
                    ? "bg-black text-white border-black shadow-lg transform scale-105"
                    : "bg-white text-gray-500 border-gray-100 hover:border-gray-200 hover:bg-gray-50"
                    }`}
                >
                  {sub}
                </button>
              ))}
            </div>
          )}

          {/* Items Grid (Category View) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 pb-32">
            {filteredItems.map((item) => (
              <MenuCard
                key={item._id}
                id={item._id}
                name={item.name}
                price={item.price}
                image={item.image}
                qty={cart[item._id]?.qty || 0}
                category={item.veg ? 'veg' : 'nonveg'}
                onAdd={() => addItem(item)}
                onRemove={() => removeItem(item)}
              />
            ))}
            {filteredItems.length === 0 && (
              <div className="col-span-full py-20 text-center flex flex-col items-center text-gray-400">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-2xl">🔍</div>
                <p>No items found trying adjusting filters.</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ================= ROOT VIEW: CATEGORIES + HEADER ================= */
        <div className="animate-fadeIn">
          {/* Header & Filters & SEARCH BAR */}
          <div className="flex flex-col md:flex-row justify-between items-end gap-4 mb-8">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-800">Menu Categories</h2>
              <p className="text-sm text-gray-500">Select a category to browse items</p>
            </div>

            {/* SEARCH BAR (Visible in Root View) */}
            <div className="flex-1 w-full md:max-w-md relative">
              <input
                className="w-full bg-white border border-gray-200 rounded-xl py-2.5 pl-4 pr-10 text-sm font-bold outline-none focus:ring-2 focus:ring-black/5 transition-all shadow-sm"
                placeholder="Search for any item..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus={!!searchQuery}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
              </div>
              {/* Clear Button if searching */}
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-10 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black bg-gray-100 rounded-full p-1"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              )}
            </div>

            {/* Global Filters */}
            <div className="bg-gray-100 p-1 rounded-xl flex gap-1 shrink-0">
              {[{ id: "all", label: "All" }, { id: "veg", label: "Veg" }, { id: "nonveg", label: "Non-Veg" }, { id: "drinks", label: "Drinks" }].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-300 ${category === cat.id
                    ? "bg-white text-black shadow-sm"
                    : "text-gray-500 hover:text-gray-900"
                    }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* CONTENT: Categories OR Search Results */}
          {!searchQuery ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {allCategories.map(cat => (
                <button
                  key={cat.name}
                  onClick={() => setSelectedCategory(cat)}
                  className="flex flex-col items-center gap-4 group w-full p-6 rounded-3xl hover:bg-white hover:shadow-xl transition-all border border-transparent hover:border-gray-100 bg-gray-50/50"
                >
                  <div className="w-28 h-28 rounded-full overflow-hidden shadow-lg border-4 border-white group-hover:scale-105 transition-transform relative shrink-0">
                    <img
                      src={cat.image}
                      className={`w-full h-full object-cover`}
                      alt={cat.name}
                      onError={(e) => e.target.src = "https://placehold.co/100"}
                    />
                  </div>
                  <div className="h-10 flex items-center justify-center w-full">
                    <span className="text-sm font-bold text-center text-gray-800 leading-tight px-1 line-clamp-2">
                      {cat.name}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="animate-slideIn">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-800">Search Results</h3>
                <span className="text-sm text-gray-500">{filteredItems.length} items found</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 pb-32">
                {filteredItems.map((item) => (
                  <MenuCard
                    key={item._id}
                    id={item._id}
                    name={item.name}
                    price={item.price}
                    image={item.image}
                    qty={cart[item._id]?.qty || 0}
                    category={item.veg ? 'veg' : 'nonveg'}
                    onAdd={() => addItem(item)}
                    onRemove={() => removeItem(item)}
                  />
                ))}
                {filteredItems.length === 0 && (
                  <div className="col-span-full py-20 text-center flex flex-col items-center text-gray-400">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-2xl">🔍</div>
                    <p>No items found for "{searchQuery}".</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Cart Summary Bar */}
      {Object.keys(cart).length > 0 && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 w-[90%] md:w-[600px] glass rounded-2xl px-6 py-4 flex justify-between items-center z-50 animate-slideIn">
          <div className="text-sm">
            <span className="font-bold text-lg">
              {Object.values(cart).reduce((s, i) => s + i.qty, 0)}
            </span>{" "}
            items | <span className="font-bold text-lg">₹ {Object.values(cart).reduce(
              (s, i) => s + i.qty * i.price,
              0
            ).toFixed(2)}</span>
          </div>

          <Link
            to="/receipt"
            state={{
              mode: isTakeaway ? 'takeaway' : null,
              tableId: tableId,
              order: existingOrder
            }}
            className="bg-black text-white px-8 py-2.5 rounded-xl text-sm font-bold shadow-lg hover:bg-gray-900 transition-all hover:scale-105 active:scale-95"
          >
            {tableId ? `Bill Table ${tableId}` : "View Cart"}
          </Link>

        </div>
      )}
    </PageWrapper>
  );
}
