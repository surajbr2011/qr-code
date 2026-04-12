// ✅ REQUIRED IMPORTS (THIS WAS MISSING)
import { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState({});
  const [table, setTable] = useState(null); // selected table / room

  // 🎟️ Active Offer (Global Item-Level Discount)
  const [activeOffer, setActiveOffer] = useState(() => {
    const saved = sessionStorage.getItem("admin_active_offer");
    return saved ? JSON.parse(saved) : null;
  });

  // Persist Offer
  useEffect(() => {
    if (activeOffer) {
      sessionStorage.setItem("admin_active_offer", JSON.stringify(activeOffer));
    } else {
      sessionStorage.removeItem("admin_active_offer");
    }
  }, [activeOffer]);

  const activateOffer = (offer) => {
    setActiveOffer(offer);
  };

  const deactivateOffer = () => {
    setActiveOffer(null);
  };

  const addItem = (item, qtyToAdd = 1) => {
    const id = item._id || item.id;
    setCart((prev) => ({
      ...prev,
      [id]: {
        ...item,
        qty: (prev[id]?.qty || 0) + qtyToAdd,
      },
    }));
  };

  const removeItem = (item) => {
    const id = item._id || item.id;
    setCart((prev) => {
      if (!prev[id]) return prev;

      const qty = prev[id].qty - 1;
      if (qty <= 0) {
        const updated = { ...prev };
        delete updated[id];
        return updated;
      }

      return {
        ...prev,
        [id]: { ...prev[id], qty },
      };
    });
  };

  const clearCart = () => {
    setCart({});
    setTable(null);
    setActiveOffer(null); // Also clear offer on reset
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addItem,
        removeItem,
        table,
        setTable,
        clearCart,
        activeOffer,
        activateOffer,
        deactivateOffer
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);

