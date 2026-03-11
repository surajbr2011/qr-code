import { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
    // Load cart from localStorage or empty array
    const [cartItems, setCartItems] = useState(() => {
        const saved = localStorage.getItem("staff_cart_v1");
        return saved ? JSON.parse(saved) : [];
    });

    // Persistence Effect
    useEffect(() => {
        localStorage.setItem("staff_cart_v1", JSON.stringify(cartItems));
    }, [cartItems]);

    const addToCart = (item) => {
        setCartItems((prev) => {
            const existing = prev.find((i) => i.id === item.id);
            if (existing) {
                return prev.map((i) =>
                    i.id === item.id ? { ...i, qty: i.qty + 1 } : i
                );
            }
            return [...prev, { ...item, qty: 1 }];
        });
    };

    const increaseQty = (id) => {
        setCartItems((prev) =>
            prev.map((i) => (i.id === id ? { ...i, qty: i.qty + 1 } : i))
        );
    };

    const decreaseQty = (id) => {
        setCartItems((prev) =>
            prev
                .map((i) => (i.id === id ? { ...i, qty: i.qty - 1 } : i))
                .filter((i) => i.qty > 0)
        );
    };

    const clearCart = () => {
        setCartItems([]);
    };

    return (
        <CartContext.Provider
            value={{ cartItems, addToCart, increaseQty, decreaseQty, clearCart }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    return useContext(CartContext);
}
