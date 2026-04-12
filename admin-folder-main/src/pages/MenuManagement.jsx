import { useState, useEffect } from "react";
import PageWrapper from "../components/layout/PageWrapper";
import {
  PlusCircle,
  Tag,
  Edit3,
  Upload,
  CheckCircle,
  Leaf,
  Drumstick,
  Image as ImageIcon,
  Trash2,
  Search,
  ArrowLeft,
  GlassWater,
  Percent
} from "lucide-react";
import api from "../utils/api";
import toast from "react-hot-toast";

export default function MenuManagement() {
  const [activeTab, setActiveTab] = useState("item"); // item, offer, edit
  const [menuItems, setMenuItems] = useState([]);
  const [promoCodes, setPromoCodes] = useState([]);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("All"); // All, Veg, Non-Veg, Drinks
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState("All");

  // Edit Mode State
  const [editingId, setEditingId] = useState(null);
  const [offerEditingId, setOfferEditingId] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    foodType: "veg",
    category: "Main Course",
    available: true,
    available: true,
    imageUrl: "",
    promoCode: "" // New field
  });
  const [imageFile, setImageFile] = useState(null);

  // Promo Code Form State
  const [promoForm, setPromoForm] = useState({
    code: "",
    discountPercent: "",
    startDate: "",
    endDate: "",
    minOrderAmount: ""
  });

  // Fetch Items on Mount
  useEffect(() => {
    fetchMenuItems();
    fetchPromoCodes();
    fetchOffers();
  }, []);

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/menu");
      setMenuItems(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch menu");
    } finally {
      setLoading(false);
    }
  };

  const fetchPromoCodes = async () => {
    try {
      const { data } = await api.get("/promocodes");
      setPromoCodes(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch promo codes");
    }
  };

  const fetchOffers = async () => {
    try {
      const { data } = await api.get("/offers");
      setOffers(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch offers");
    }
  };

  const uploadImage = async (file) => {
    if (!file) return null;
    const formData = new FormData();
    formData.append("image", file);
    const { data } = await api.post("/menu/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data.url;
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      foodType: "veg",
      category: "Main Course",
      available: true,
      available: true,
      imageUrl: "",
      promoCode: ""
    });
    setImageFile(null);
    setEditingId(null);
    setOfferEditingId(null);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.price || !formData.category) {
      toast.error("Please fill required fields");
      return;
    }

    try {
      let url = formData.imageUrl;
      if (imageFile) {
        toast.loading("Uploading image...");
        url = await uploadImage(imageFile);
        toast.dismiss();
      }

      const payload = { ...formData, price: Number(formData.price), imageUrl: url };

      if (editingId) {
        // UPDATE
        await api.put(`/menu/${editingId}`, payload);
        toast.success("Item Updated Successfully");
      } else {
        // CREATE
        await api.post("/menu", payload);
        toast.success("Item Created Successfully");
      }

      fetchMenuItems();
      resetForm();
      if (editingId) setActiveTab("edit"); // Stay on manage tab if editing
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Operation failed");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await api.delete(`/menu/${id}`);
      toast.success("Item Deleted");
      setMenuItems(prev => prev.filter(i => i._id !== id));
    } catch (err) {
      toast.error("Failed to delete");
    }
  };

  const startEdit = (item) => {
    setEditingId(item._id);
    setFormData({
      name: item.name,
      description: item.description,
      price: item.price,
      foodType: item.category === 'veg' ? 'veg' : 'nonveg', // Adjust based on DB logic if needed
      category: item.category,
      available: item.isAvailable,
      imageUrl: item.image
    });
    setActiveTab("item"); // Use the 'item' tab for editing form
  };

  /* ================= FILTER LOGIC ================= */
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

  // Dynamically merge DB categories with known images
  const uniqueCategories = [...new Set(menuItems.map(item => item.category?.trim()))].filter(Boolean);

  const categoryOrder = [
    "Starters",
    "Main Course",
    "Fresh Salad / Soups / Pasta",
    "Sandwich & Sizzlers",
    "Maggie, Pan Cake, Momos",
    "Breakfast",
    "Egg, Omelette, Toast",
    "Tea/Coffee/Milk",
    "Juice/Shake/Lassi",
    "Dessert & Cold Stuff",
    "Whisky, Rum, Cocktails, Beer",
    "Spirits & Wines"
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

  const DRINKS_CATEGORIES = ['Drinks', 'Beverages (Non-Alcohol)', 'Alcoholic Beverages', 'Spirits'];

  const filteredItems = menuItems.filter(item => {
    // 1. Search Filter
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());

    // 2. Type Filter
    let matchesType = true;
    if (filterType === "Veg") matchesType = Boolean(item.veg) === true;
    if (filterType === "Non-Veg") matchesType = Boolean(item.veg) === false;
    if (filterType === "Drinks") matchesType = DRINKS_CATEGORIES.includes(item.category);

    // 3. Category Filter (Drill Down)
    let matchesCategory = true;
    if (selectedCategory) {
      matchesCategory = item.category === selectedCategory.name;
    }

    // 4. Sub-category Filter
    let matchesSubCategory = true;
    if (selectedCategory && selectedSubCategory !== "All") {
      matchesSubCategory = item.subCategory === selectedSubCategory;
    }



    return matchesSearch && matchesType && matchesCategory && matchesSubCategory;
  });

  // Get unique sub-categories for current selected category
  const subCategories = selectedCategory
    ? ["All", ...new Set(menuItems.filter(i => i.category === selectedCategory.name && i.subCategory).map(i => i.subCategory))]
    : [];



  /* ================= MODERN TAB STYLES ================= */
  const tabBase =
    "px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 flex items-center gap-2";
  const tabActive = "bg-black text-white shadow-lg transform scale-105";
  const tabInactive =
    "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:text-black";

  return (
    <PageWrapper>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold mb-1">Menu Management</h1>
          <p className="text-sm text-[var(--text-gray)]">
            Manage your restaurant menu, offers and prices
          </p>
        </div>

        {/* Action Buttons - Scrollable on mobile */}
        <div className="w-full md:w-auto overflow-x-auto md:overflow-visible py-4 -mx-4 px-4 md:mx-0 md:px-2 scrollbar-hide">
          <div className="flex gap-2 min-w-max">
            <button
              onClick={() => { setActiveTab("item"); resetForm(); }}
              className={`${tabBase} ${activeTab === "item" ? tabActive : tabInactive}`}
            >
              <PlusCircle size={18} />
              {editingId ? "Edit Item" : "Add Item"}
            </button>
            <button
              onClick={() => { setActiveTab("offer"); resetForm(); }}
              className={`${tabBase} ${activeTab === "offer" ? tabActive : tabInactive}`}
            >
              <Tag size={18} />
              Add Offer
            </button>
            <button
              onClick={() => { setActiveTab("edit"); resetForm(); }}
              className={`${tabBase} ${activeTab === "edit" ? tabActive : tabInactive}`}
            >
              <Edit3 size={18} />
              Manage
            </button>
            <button
              onClick={() => { setActiveTab("promo"); resetForm(); }}
              className={`${tabBase} ${activeTab === "promo" ? tabActive : tabInactive}`}
            >
              <Percent size={18} />
              Promo Codes
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-lg min-h-[80vh]">

        {/* ================= ADD / EDIT FORM ================= */}
        {activeTab === "item" && (
          <div className="animate-fadeIn max-w-4xl mx-auto">
            <h2 className="font-medium mb-8 flex items-center gap-2 text-xl border-b pb-4">
              {editingId ? <Edit3 size={20} /> : <PlusCircle size={20} />}
              {editingId ? "Edit Menu Item" : "Create New Menu Item"}
            </h2>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-5">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase ml-1 mb-1 block">Item Name</label>
                  <input
                    className="input w-full"
                    placeholder="e.g. Butter Chicken"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase ml-1 mb-1 block">Description</label>
                  <textarea
                    className="input w-full h-32 resize-none"
                    placeholder="Detailed description of the dish..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase ml-1 mb-1 block">Price (₹)</label>
                  <input
                    type="number"
                    className="input w-full"
                    placeholder="299"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  />
                </div>

                <div className="flex flex-wrap gap-4 sm:gap-8 pt-2">
                  <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                    <input
                      type="radio"
                      className="w-4 h-4 text-red-600 focus:ring-red-500"
                      checked={formData.foodType === "nonveg"}
                      onChange={() => setFormData({ ...formData, foodType: "nonveg" })}
                    />
                    <span className="flex items-center gap-1.5"><Drumstick size={16} className="text-red-500" /> Non-Veg</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                    <input
                      type="radio"
                      className="w-4 h-4 text-green-600 focus:ring-green-500"
                      checked={formData.foodType === "veg"}
                      onChange={() => setFormData({ ...formData, foodType: "veg" })}
                    />
                    <span className="flex items-center gap-1.5"><Leaf size={16} className="text-green-500" /> Veg</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                    <input
                      type="radio"
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                      checked={formData.foodType === "drinks"}
                      onChange={() => setFormData({ ...formData, foodType: "drinks" })}
                    />
                    <span className="flex items-center gap-1.5"><GlassWater size={16} className="text-blue-500" /> Drinks</span>
                  </label>
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase ml-1 mb-1 block">Category</label>
                  <select
                    className="input w-full"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option>Starters</option>
                    <option>Main Course</option>
                    <option>Fresh Salad / Soups / Pasta</option>
                    <option>Sandwich & Sizzlers</option>
                    <option>Maggie, Pan Cake, Momos</option>
                    <option>Breakfast</option>
                    <option>Egg, Omelette, Toast</option>
                    <option>Tea/Coffee/Milk</option>
                    <option>Juice/Shake/Lassi</option>
                    <option>Dessert & Cold Stuff</option>
                    <option>Whisky, Rum, Cocktails, Beer</option>
                    <option>Spirits & Wines</option>
                  </select>
                </div>

                <UploadBox file={imageFile} setFile={setImageFile} />

                {formData.imageUrl && !imageFile && (
                  <div className="relative group rounded-xl overflow-hidden border border-gray-200 w-full h-48 bg-gray-50">
                    <img src={formData.imageUrl} className="w-full h-full object-cover" alt="Preview" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-xs font-bold">
                      Current Image
                    </div>
                  </div>
                )}

                <div
                  className={`flex items-center gap-3 p-4 rounded-xl border border-dashed cursor-pointer transition-colors ${formData.available ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}
                  onClick={() => setFormData({ ...formData, available: !formData.available })}
                >
                  <div className={`w-10 h-6 rounded-full p-1 transition-colors ${formData.available ? 'bg-green-500' : 'bg-gray-300'}`}>
                    <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform ${formData.available ? 'translate-x-4' : 'translate-x-0'}`} />
                  </div>
                  <span className="text-sm font-medium text-gray-700">Available for Ordering</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-10 pt-6 border-t">
              {editingId && <button className="px-6 py-2.5 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition" onClick={resetForm}>Cancel</button>}
              <button className="px-8 py-2.5 rounded-xl font-bold bg-black text-white hover:bg-gray-800 transition shadow-lg" onClick={handleSubmit}>
                {editingId ? "Update Item" : "Create Item"}
              </button>
            </div>
          </div>
        )}

        {/* ================= ADD OFFER ================= */}
        {activeTab === "offer" && (
          <div className="animate-fadeIn max-w-4xl mx-auto">
            <h2 className="font-medium mb-8 flex items-center gap-2 text-xl border-b pb-4">
              <Tag size={20} /> {offerEditingId ? "Edit Offer" : "Create New Offer"}
            </h2>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-5">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase ml-1 mb-1 block">Offer Title</label>
                  <input
                    className="input w-full"
                    placeholder="e.g. Weekend Blast"
                    value={formData.title || ''}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase ml-1 mb-1 block">Description</label>
                  <textarea
                    className="input w-full h-32 resize-none"
                    placeholder="Describe the offer..."
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase ml-1 mb-1 block">Discount (%)</label>
                    <input
                      type="number"
                      className="input w-full"
                      placeholder="20"
                      value={formData.discount || ''}
                      onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase ml-1 mb-1 block">Valid Until</label>
                    <input
                      type="date"
                      className="input w-full"
                      value={formData.validUntil || ''}
                      onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="text-xs font-bold text-gray-500 uppercase ml-1 mb-1 block">Linked Promo Code (Optional)</label>
                  <input
                    className="input w-full"
                    placeholder="e.g. WELCOME50"
                    value={formData.promoCode || ''}
                    onChange={(e) => setFormData({ ...formData, promoCode: e.target.value })}
                  />
                  <p className="text-xs text-gray-400 mt-1 ml-1">Example: If user clicks "Redeem", this code will be auto-applied in cart.</p>
                </div>
              </div>

              <div className="space-y-5">
                <UploadBox file={imageFile} setFile={setImageFile} />

                {/* Preview Banner */}
                {(imageFile || formData.imageUrl) && (
                  <div className="rounded-xl overflow-hidden border border-gray-200">
                    <img
                      src={imageFile ? URL.createObjectURL(imageFile) : formData.imageUrl}
                      className="w-full h-32 object-cover"
                      alt="Preview"
                    />
                  </div>
                )}

                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3 items-start">
                  <div className="bg-blue-100 p-2 rounded-full text-blue-600 shrink-0">
                    <Tag size={16} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-blue-900">Offer Banner Preview</h4>
                    <p className="text-xs text-blue-700 mt-1">Offers will be displayed in the sliding banner on the user menu.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-10 pt-6 border-t">

              {offerEditingId && <button className="px-6 py-2.5 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition" onClick={resetForm}>Cancel</button>}
              <button
                className="px-8 py-2.5 rounded-xl font-bold bg-black text-white hover:bg-gray-800 transition shadow-lg"
                onClick={async () => {
                  if (!formData.title || !formData.discount || !formData.validUntil || (!imageFile && !formData.imageUrl)) {
                    return toast.error("Please fill all fields & upload image");
                  }

                  try {
                    toast.loading(offerEditingId ? "Updating Offer..." : "Creating Offer...");
                    let url = formData.imageUrl;
                    if (imageFile) {
                      url = await uploadImage(imageFile);
                    }

                    const payload = {
                      title: formData.title,
                      description: formData.description,
                      discount: Number(formData.discount),
                      validUntil: formData.validUntil,
                      imageUrl: url,
                      promoCode: formData.promoCode
                    };

                    console.log("Submitting Offer Payload:", payload);

                    if (offerEditingId) {
                      const cleanId = offerEditingId.trim();
                      console.log(`Updating Offer ID: ${cleanId}`);
                      await api.put(`/offers/${cleanId}`, payload);
                      toast.success("Offer Updated Successfully!");
                    } else {
                      await api.post('/offers', payload);
                      toast.success("Offer Created Successfully!");
                    }

                    toast.dismiss();
                    resetForm();
                    fetchOffers();
                    // Keep on offer tab
                  } catch (err) {
                    toast.dismiss();
                    console.error(err);
                    toast.error("Failed to save offer");
                  }
                }}
              >
                {offerEditingId ? "Update Offer" : "Create Offer"}
              </button>
            </div>
          </div>

        )}

        {/* ================= ACTIVE OFFERS LIST ================= */}
        {activeTab === "offer" && offers.length > 0 && (
          <div className="animate-fadeIn max-w-4xl mx-auto mt-12 pt-8 border-t border-gray-100">
            <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
              <Tag size={20} className="text-black" /> Active Offers
            </h3>
            <div className="grid grid-cols-1 gap-4">
              {offers.map((offer) => (
                <div key={offer._id} className="bg-white border border-gray-100 rounded-xl p-4 flex gap-4 items-center shadow-sm hover:shadow-md transition group">
                  <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0 bg-gray-100">
                    <img src={offer.imageUrl} alt={offer.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900">{offer.title}</h4>
                    <p className="text-sm text-gray-500 line-clamp-1">{offer.description}</p>
                    <div className="flex gap-4 mt-2 text-xs font-medium">
                      <span className="text-green-600 bg-green-50 px-2 py-0.5 rounded border border-green-100">{offer.discount}% OFF</span>
                      <span className="text-gray-400">Valid until: {new Date(offer.validUntil).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setOfferEditingId(offer._id);
                        setFormData({
                          title: offer.title,
                          description: offer.description,
                          discount: offer.discount,
                          validUntil: offer.validUntil ? offer.validUntil.split('T')[0] : '', // Format date for input
                          discount: offer.discount,
                          validUntil: offer.validUntil ? offer.validUntil.split('T')[0] : '', // Format date for input
                          imageUrl: offer.imageUrl,
                          promoCode: offer.promoCode || ''
                        });
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="p-2.5 text-black hover:bg-gray-100 rounded-full transition-colors"
                      title="Edit Offer"
                    >
                      <Edit3 size={18} />
                    </button>
                    <button
                      onClick={async () => {
                        if (window.confirm("Delete this offer?")) {
                          try {
                            await api.delete(`/offers/${offer._id}`);
                            toast.success("Offer Deleted");
                            fetchOffers();
                          } catch (e) {
                            toast.error("Failed to delete");
                          }
                        }
                      }}
                      className="p-2.5 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                      title="Delete Offer"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= MANAGE ITEMS (UPDATED GRID DESIGN) ================= */}
        {activeTab === "edit" && (
          <div className="animate-fadeIn">

            {/* SEARCH & FILTER BAR */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6 sticky top-0 bg-white z-10 py-2">
              <div className="relative w-full md:w-96">
                <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
                <input
                  className="pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-black/5"
                  placeholder="Search menu items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Type Filters (Veg/Non-Veg/Drinks) */}
              <div className="flex bg-gray-100 p-1 rounded-xl">
                {["All", "Veg", "Non-Veg", "Drinks"].map(type => (
                  <button
                    key={type}
                    onClick={() => setFilterType(type)}
                    className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${filterType === type
                      ? (type === 'Veg' ? 'bg-green-600 text-white shadow-sm'
                        : type === 'Non-Veg' ? 'bg-red-600 text-white shadow-sm'
                          : type === 'Drinks' ? 'bg-blue-600 text-white shadow-sm'
                            : 'bg-white text-gray-900 shadow-sm')
                      : 'text-gray-500 hover:text-gray-700'
                      }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* BREADCRUMB & BACK BUTTON */}
            {selectedCategory && (
              <div className="flex items-center gap-2 mb-6 text-sm">
                <button
                  onClick={() => { setSelectedCategory(null); setSelectedSubCategory("All"); setFilterType("All"); }}
                  className="flex items-center gap-1 text-gray-500 hover:text-black font-medium transition-colors"
                >
                  <ArrowLeft size={16} /> Back to Categories
                </button>
                <span className="text-gray-300">/</span>
                <span className="font-bold text-gray-900">{selectedCategory.name}</span>
              </div>
            )}

            {/* MAIN CONTENT VIEW SWITCHER */}
            {!selectedCategory ? (
              /* === VIEW 1: CATEGORY GRID === */
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {allCategories.filter(cat => {
                  // Filter categories based on active filterType
                  if (filterType === "All") return true;

                  // Check if this category has any items matching the filter
                  return menuItems.some(item => {
                    const isCatMatch = item.category === cat.name;
                    if (!isCatMatch) return false;

                    if (filterType === "Veg") return item.veg === true;
                    if (filterType === "Non-Veg") return item.veg === false;
                    if (filterType === "Drinks") return DRINKS_CATEGORIES.includes(item.category);

                    return true;
                  });
                }).map(cat => (
                  <button
                    key={cat.name}
                    onClick={() => { setSelectedCategory(cat); setFilterType("All"); }}
                    className="flex flex-col items-center gap-4 group w-full p-6 rounded-3xl hover:bg-white hover:shadow-xl transition-all border border-transparent hover:border-gray-100 bg-gray-50/50"
                  >
                    <div className="w-28 h-28 rounded-full overflow-hidden shadow-lg border-4 border-white group-hover:scale-105 transition-transform relative shrink-0">
                      <img
                        src={cat.image}
                        className="w-full h-full object-cover"
                        alt={cat.name}
                        onError={(e) => e.target.src = "https://placehold.co/150"}
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
              /* === VIEW 2: ITEMS GRID (Drilled Down) === */
              <>
                {/* Sub-category Pills */}
                {subCategories.length > 1 && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {subCategories.map(sub => (
                      <button
                        key={sub}
                        onClick={() => setSelectedSubCategory(sub)}
                        className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all ${selectedSubCategory === sub
                          ? "bg-black text-white border-black"
                          : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                          }`}
                      >
                        {sub}
                      </button>
                    ))}
                  </div>
                )}

                {/* Items Grid */}
                {filteredItems.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredItems.map((item) => (
                      <div key={item._id} className="bg-white rounded-2xl p-3 flex gap-3 shadow-sm border border-gray-100 hover:shadow-md transition-all group">
                        {/* Image Section */}
                        <div className="w-24 h-24 flex-shrink-0 bg-gray-100 rounded-xl overflow-hidden relative">
                          <img
                            src={item.image || "https://via.placeholder.com/150"}
                            className="w-full h-full object-cover"
                            alt={item.name}
                          />

                          {/* Veg/Non-Veg Badge */}
                          <div className="absolute top-1 left-1 bg-white/90 p-[2px] rounded-sm shadow-sm">
                            <div className={`w-3 h-3 border ${item.veg ? "border-green-600" : "border-red-600"} flex items-center justify-center`}>
                              <div className={`w-1.5 h-1.5 ${item.veg ? "bg-green-600" : "bg-red-600"} rounded-full`}></div>
                            </div>
                          </div>

                          {/* HOVER OVERLAY ACTIONS */}
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <button
                              onClick={() => startEdit(item)}
                              className="bg-white text-black p-2 rounded-full hover:bg-gray-100 transition-colors"
                              title="Edit Item"
                            >
                              <Edit3 size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(item._id)}
                              className="bg-white text-red-500 p-2 rounded-full hover:bg-red-50 transition-colors"
                              title="Delete Item"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>

                        {/* Content Section */}
                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between items-start">
                              <h3 className="text-sm font-bold text-gray-900 leading-tight line-clamp-2">{item.name}</h3>
                            </div>
                            <p className="text-[10px] text-gray-500 mt-1 line-clamp-1">{item.subCategory || item.category}</p>
                          </div>

                          <div className="flex justify-between items-end mt-2">
                            <span className="text-base font-bold text-gray-900">₹{item.price}</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${item.isAvailable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                              {item.isAvailable ? 'IN STOCK' : 'OUT'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                    <div className="bg-gray-50 p-4 rounded-full mb-3">
                      <Search size={32} className="opacity-20" />
                    </div>
                    <p>No items found inside this category.</p>
                    <button onClick={() => { setSearchTerm(""); setFilterType("All"); }} className="text-sm text-blue-500 font-bold mt-2 hover:underline">
                      Clear Search/Filters
                    </button>
                  </div>
                )}
              </>
            )}

          </div>
        )}

        {/* ================= PROMO CODES TAB ================= */}
        {activeTab === "promo" && (
          <div className="animate-fadeIn max-w-5xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              {/* CREATE FORM */}
              <div className="md:col-span-1 space-y-6">
                <h2 className="font-medium mb-4 flex items-center gap-2 text-xl border-b pb-4">
                  <PlusCircle size={20} /> Create Promo Code
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase ml-1 mb-1 block">Code</label>
                    <input
                      className="input w-full uppercase"
                      placeholder="e.g. SAVE20"
                      value={promoForm.code}
                      onChange={(e) => setPromoForm({ ...promoForm, code: e.target.value.toUpperCase() })}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase ml-1 mb-1 block">Discount (%)</label>
                    <input
                      type="number"
                      className="input w-full"
                      placeholder="20"
                      value={promoForm.discountPercent}
                      onChange={(e) => setPromoForm({ ...promoForm, discountPercent: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase ml-1 mb-1 block">Min Order Amount (₹)</label>
                    <input
                      type="number"
                      className="input w-full"
                      placeholder="0"
                      value={promoForm.minOrderAmount}
                      onChange={(e) => setPromoForm({ ...promoForm, minOrderAmount: e.target.value })}
                    />
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase ml-1 mb-1 block">Start Date & Time</label>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <input
                          type="date"
                          className="input w-full"
                          value={promoForm.startDate ? promoForm.startDate.split('T')[0] : ""}
                          onChange={(e) => {
                            const date = e.target.value;
                            const time = promoForm.startDate ? promoForm.startDate.split('T')[1] : "00:00";
                            setPromoForm({ ...promoForm, startDate: date ? `${date}T${time}` : "" });
                          }}
                        />
                        <input
                          type="time"
                          className="input w-full sm:w-32"
                          value={promoForm.startDate ? promoForm.startDate.split('T')[1] : ""}
                          onChange={(e) => {
                            const time = e.target.value;
                            const date = promoForm.startDate ? promoForm.startDate.split('T')[0] : new Date().toISOString().split('T')[0];
                            setPromoForm({ ...promoForm, startDate: `${date}T${time}` });
                          }}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase ml-1 mb-1 block">End Date & Time</label>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <input
                          type="date"
                          className="input w-full"
                          value={promoForm.endDate ? promoForm.endDate.split('T')[0] : ""}
                          onChange={(e) => {
                            const date = e.target.value;
                            const time = promoForm.endDate ? promoForm.endDate.split('T')[1] : "00:00";
                            setPromoForm({ ...promoForm, endDate: date ? `${date}T${time}` : "" });
                          }}
                        />
                        <input
                          type="time"
                          className="input w-full sm:w-32"
                          value={promoForm.endDate ? promoForm.endDate.split('T')[1] : ""}
                          onChange={(e) => {
                            const time = e.target.value;
                            const date = promoForm.endDate ? promoForm.endDate.split('T')[0] : new Date().toISOString().split('T')[0];
                            setPromoForm({ ...promoForm, endDate: `${date}T${time}` });
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    className="w-full py-2.5 rounded-xl font-bold bg-black text-white hover:bg-gray-800 transition shadow-lg mt-4"
                    onClick={async () => {
                      if (!promoForm.code || !promoForm.discountPercent || !promoForm.startDate || !promoForm.endDate) {
                        toast.error("Please fill all required fields");
                        return;
                      }
                      try {
                        await api.post("/promocodes", promoForm);
                        toast.success("Promo Code Created!");
                        setPromoForm({ code: "", discountPercent: "", startDate: "", endDate: "", minOrderAmount: "" });
                        fetchPromoCodes();
                      } catch (err) {
                        toast.error(err.response?.data?.message || "Failed to create");
                      }
                    }}
                  >
                    Create Promo Code
                  </button>
                </div>
              </div>

              {/* LIST */}
              <div className="md:col-span-2">
                <h2 className="font-medium mb-4 flex items-center gap-2 text-xl border-b pb-4">
                  <Percent size={20} /> Active Promo Codes
                </h2>

                <div className="space-y-3">
                  {promoCodes.length === 0 ? (
                    <p className="text-gray-500 text-sm text-center py-10">No promo codes found.</p>
                  ) : (
                    promoCodes.map((promo) => (
                      <div key={promo._id} className="bg-white border border-gray-100 rounded-xl p-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 shadow-sm hover:shadow-md transition">
                        <div>
                          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                            <span className="font-bold text-base sm:text-lg text-black bg-gray-100 px-3 py-1 rounded-lg border border-gray-200 tracking-wider">
                              {promo.code}
                            </span>
                            <span className="text-xs sm:text-sm font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-md border border-green-100">
                              {promo.discountPercent}% OFF
                            </span>
                          </div>
                          <div className="text-[10px] sm:text-xs text-gray-500 mt-2 flex flex-col sm:flex-row sm:gap-4 gap-1">
                            <span>Valid: {new Date(promo.startDate).toLocaleString()} - {new Date(promo.endDate).toLocaleString()}</span>
                            <span className="hidden sm:inline">•</span>
                            <span>Min Order: ₹{promo.minOrderAmount}</span>
                          </div>
                        </div>
                        <button
                          onClick={async () => {
                            if (window.confirm("Delete this promo code?")) {
                              try {
                                await api.delete(`/promocodes/${promo._id}`);
                                toast.success("Deleted");
                                fetchPromoCodes();
                              } catch (e) { toast.error("Failed"); }
                            }
                          }}
                          className="flex items-center justify-center gap-2 w-full sm:w-auto p-2.5 sm:p-2 text-red-500 hover:bg-red-50 rounded-lg transition border border-red-100 sm:border-transparent font-bold sm:font-normal"
                        >
                          <Trash2 size={18} className="sm:hidden" />
                          <span>Delete</span>
                          <Trash2 size={18} className="hidden sm:block" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </PageWrapper>
  );
}

function UploadBox({ file, setFile }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-2">
        <Upload size={14} /> Upload Image
      </label>
      <div className="border border-dashed border-gray-300 rounded-xl p-1 flex gap-2 items-center bg-gray-50/50 hover:bg-gray-50 transition-colors">
        <input
          readOnly
          value={file ? file.name : ""}
          placeholder="No file selected"
          className="flex-1 bg-transparent px-3 text-sm text-gray-600 outline-none placeholder:text-gray-400"
        />
        <label className="bg-black text-white px-4 py-2 rounded-lg text-xs font-bold cursor-pointer hover:bg-gray-900 transition-colors flex items-center gap-2">
          <Upload size={14} />
          Browse
          <input
            hidden
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files[0])}
          />
        </label>
      </div>
      {file && (
        <p className="text-xs text-green-600 font-medium pl-1 flex items-center gap-1">
          <CheckCircle size={12} /> {file.name}
        </p>
      )}
    </div>
  );
}
