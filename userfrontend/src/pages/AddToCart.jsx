import { useState } from "react";
import PageWrapper from "../components/PageWrapper";
import { useNavigate } from "react-router-dom";
import BottomNav from "../components/BottomNav";
import { useCart } from "../context/CartContext";
import toast from "react-hot-toast";

export default function AddToCart() {
  const navigate = useNavigate();
  const { cartItems, placeOrder, increaseQty, decreaseQty } = useCart();
  const [loading, setLoading] = useState(false);

  // Calculate total price
  const price = cartItems.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const total = price; // Add tax logic if you want later

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) {
      toast.error("Cart is empty");
      return;
    }

    try {
      setLoading(true);
      const newOrder = await placeOrder();
      toast.success("Order Placed!");
      // Navigate to confirmation with order details
      navigate("/order-confirmation", { state: { orderId: newOrder._id } });
    } catch (err) {
      toast.error("Failed to place order. Try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper className="min-h-screen bg-white pb-16">

      {/* Header */}
      <div className="px-4 py-4 border-b">
        <h1 className="text-xl font-bold">Your Cart</h1>
      </div>

      {/* Cart Items List */}
      <div className="flex-1 overflow-y-auto">
        {cartItems.length === 0 ? (
          <div className="p-8 text-center text-gray-500">Your cart is empty</div>
        ) : (
          cartItems.map((item) => (
            <div key={item._id || item.id} className="flex items-center px-4 py-4 border-b">
              <div className="w-16 h-16 bg-gray-200 rounded overflow-hidden">
                {/* Placeholder or real image */}
                <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">IMG</div>
              </div>

              <div className="ml-4 flex-1">
                <h2 className="font-semibold text-lg">
                  {item.name}
                </h2>
                <p className="text-gray-500">₹{item.price}</p>
              </div>

              {/* Quantity Control */}
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => decreaseQty(item.id)}
                  className="w-8 h-8 border rounded text-lg flex items-center justify-center"
                >
                  −
                </button>

                <span className="font-semibold">{item.qty}</span>

                <button
                  onClick={() => increaseQty(item.id)}
                  className="w-8 h-8 border rounded text-lg flex items-center justify-center"
                >
                  +
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Price Summary */}
      <div className="px-4 py-4 space-y-2 bg-gray-50">
        <div className="flex justify-between text-gray-600">
          <span>Item Total</span>
          <span>₹{total}</span>
        </div>

        <div className="flex justify-between text-gray-600">
          <span>Tax</span>
          <span>₹20</span>
        </div>

        <div className="flex justify-between font-bold text-lg">
          <span>Grand Total</span>
          <span>₹{total + 20}</span>
        </div>
      </div>

      {/* Place Order Button */}
      <div className="px-4 mt-6">
        <button
          onClick={handlePlaceOrder}
          disabled={loading}
          className={`w-full bg-green-600 text-white py-3 rounded font-semibold ${loading ? 'opacity-70' : ''}`}
        >
          {loading ? 'Placing Order...' : 'Place Order'}
        </button>
      </div>

      <BottomNav />
    </PageWrapper>
  );
}
