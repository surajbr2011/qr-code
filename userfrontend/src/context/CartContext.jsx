import { createContext, useContext, useState, useEffect } from "react";
import api from "../utils/api";

const CartContext = createContext();

export function CartProvider({ children }) {
  // 🛒 Cart items
  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem("user_cart");
    return saved ? JSON.parse(saved) : [];
  });

  // 📦 Order history
  const [orders, setOrders] = useState(() => {
    const saved = localStorage.getItem("user_orders");
    return saved ? JSON.parse(saved) : [];
  });

  // ⭐ Last placed order
  const [lastOrder, setLastOrder] = useState(() => {
    const saved = localStorage.getItem("user_last_order");
    return saved ? JSON.parse(saved) : null;
  });

  // PERSISTENCE EFFECT
  useEffect(() => {
    localStorage.setItem("user_cart", JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    localStorage.setItem("user_orders", JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    if (lastOrder) localStorage.setItem("user_last_order", JSON.stringify(lastOrder));
  }, [lastOrder]);

  // ➕ Add to cart
  const addToCart = (food) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === food.id);

      if (existing) {
        return prev.map((item) =>
          item.id === food.id
            ? { ...item, qty: item.qty + 1 }
            : item
        );
      }

      return [...prev, { ...food, qty: 1 }];
    });
  };

  // ➕ Increase quantity
  const increaseQty = (id) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, qty: item.qty + 1 }
          : item
      )
    );
  };

  // ➖ Decrease quantity
  const decreaseQty = (id) => {
    setCartItems((prev) =>
      prev
        .map((item) =>
          item.id === id
            ? { ...item, qty: item.qty - 1 }
            : item
        )
        .filter((item) => item.qty > 0)
    );
  };

  // ✅ PLACE ORDER (REAL API CALL)
  const placeOrder = async (orderData = {}) => {
    try {
      const total = cartItems.reduce(
        (sum, item) => sum + item.price * item.qty,
        0
      );

      // Get user info from localStorage
      const storedUser = localStorage.getItem("user");
      const user = storedUser ? JSON.parse(storedUser) : null;

      if (cartItems.length === 0) {
        throw new Error("Cart is empty");
      }

      const payload = {
        items: cartItems.map(item => {
          // Calculate individual item price with discount if applicable
          let finalPrice = item.price;
          if (activeOffer && activeOffer.discount) {
            finalPrice = item.price - (item.price * (activeOffer.discount / 100));
          }

          return {
            menuItem: item._id || item.id,
            qty: item.qty,
            price: finalPrice, // Send discounted price to backend
            name: item.name,
            category: item.category,
            foodType: item.foodType || (item.veg ? "veg" : "non-veg")
          };
        }),
        totalAmount: cartItems.reduce((sum, item) => {
          let price = item.price;
          if (activeOffer && activeOffer.discount) {
            price = item.price - (item.price * (activeOffer.discount / 100));
          }
          return sum + (price * item.qty);
        }, 0),
        tableId: user?.tableRoom || orderData.tableId || "Unknown",
        customerName: user?.name || orderData.customerName || "Guest",
        offerApplied: activeOffer ? { id: activeOffer._id, discount: activeOffer.discount, title: activeOffer.title } : null,
        ...orderData
      };

      // Call Backend
      const { data } = await api.post("/orders", payload);

      // Save order to history (using response from backend)
      const newOrder = {
        ...data,
        date: new Date().toLocaleString()
      };

      setOrders((prev) => [newOrder, ...prev]);
      setLastOrder(newOrder);
      setCartItems([]);
      return newOrder;
    } catch (error) {
      console.error("Place Order Failed:", error);
      throw error; // Re-throw to handle in UI
    }
  };

  // 🎟️ Active Offer (Global Item-Level Discount)
  const [activeOffer, setActiveOffer] = useState(() => {
    const saved = sessionStorage.getItem("active_offer");
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (activeOffer) {
      sessionStorage.setItem("active_offer", JSON.stringify(activeOffer));
    } else {
      sessionStorage.removeItem("active_offer");
    }
  }, [activeOffer]);

  const activateOffer = (offer) => {
    setActiveOffer(offer);
  };

  const deactivateOffer = () => {
    setActiveOffer(null);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        orders,
        lastOrder,
        activeOffer, // Exported
        activateOffer, // Exported
        deactivateOffer, // Exported
        addToCart,
        increaseQty,
        decreaseQty,
        placeOrder,
        clearCart: () => setCartItems([]),
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

// Custom hook
export function useCart() {
  return useContext(CartContext);
}
