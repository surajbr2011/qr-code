import {
  CheckCircle,
  Clock,
  ChefHat,
  Smile
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import PageWrapper from "../components/PageWrapper";
import api from "../utils/api";
import { toast } from "react-hot-toast";

/* ======================================================
   MAIN PAGE
====================================================== */

export default function OrderConfirmation() {
  const navigate = useNavigate();
  const location = useLocation();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  // Get order details
  useEffect(() => {
    const fetchOrder = async () => {
      const orderId = location.state?.orderId;
      if (!orderId) {
        // navigate("/dashboard"); 
        setLoading(false);
        return;
      }

      try {
        const { data } = await api.get(`/orders/${orderId}`);
        setOrder(data);
      } catch (err) {
        console.error("Failed to load order:", err);
        toast.error("Could not load order details");
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [location.state]);

  if (loading) return <PageWrapper className="min-h-screen bg-white flex items-center justify-center">Loading...</PageWrapper>;

  if (!order) return (
    <PageWrapper className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
      <p className="text-gray-500 mb-4">Order details not found.</p>
      <button onClick={() => navigate('/menu')} className="text-orange-500 font-bold">Go Home</button>
    </PageWrapper>
  );

  const subtotal = order.totalAmount; // Backend totalAmount includes everything usually? 
  // Wait, backend 'totalAmount' is usually final.
  // Frontend Cart calculated subtotal + tax = total.
  // Let's assume order.totalAmount is the final stored value.
  // If we want breakdown and backend didn't store it separate, we back-calculate or just show total.
  // Since we stored 'items' with 'price' (unit price usually), we can recalc for display.

  const calculatedSubtotal = order.items.reduce((s, i) => s + (i.price * i.qty), 0);
  const calculatedTax = calculatedSubtotal * 0.1; // 10% tax in Cart.jsx logic (wait cart said 0.05 or 0.1?)
  // Cart.jsx said `const tax = subtotal * 0.1;` (line 29 in Step 170).
  // OrderConfirmation.jsx originally said 0.05. Logic drift!
  // I will use 0.1 to match Cart.jsx.
  // Ideally backend stores these values to be consistent. 
  // For now, I'll rely on order.totalAmount for the big number.

  return (
    <PageWrapper className="min-h-screen bg-white flex justify-center">
      <div className="w-full max-w-[430px] relative pb-28">

        {/* ================= HEADER ================= */}
        <header className="bg-orange-500 rounded-b-3xl pt-10 pb-16 text-center text-white">
          <div className="mx-auto w-16 h-16 rounded-full border-2 border-white flex items-center justify-center mb-4">
            <CheckCircle size={34} />
          </div>

          <h1 className="text-lg font-semibold">
            Order Placed Successfully!
          </h1>

          <p className="text-sm mt-1 opacity-90">
            Order ID: #{order._id.slice(-6).toUpperCase()}
          </p>
          <p className="text-sm opacity-90">
            {order.tableNo}
          </p>
        </header>

        {/* ================= ETA CARD ================= */}
        <section className="-mt-10 px-4">
          <div className="bg-white rounded-xl shadow-md p-4 flex items-center gap-3">
            <Clock className="text-orange-500" size={22} />
            <div>
              <p className="text-xs text-gray-500">
                Estimated Time
              </p>
              <p className="font-semibold text-orange-500">
                25 Minutes
              </p>
            </div>
          </div>
        </section>

        {/* ================= STATUS TIMELINE ================= */}
        <section className="px-4 mt-8">
          <h2 className="text-sm font-semibold mb-4">
            Order Status
          </h2>

          <StatusTimeline currentStatus={order.status} />
        </section>

        {/* ================= ORDER ITEMS ================= */}
        <section className="px-4 mt-8">
          <h2 className="text-sm font-semibold mb-4">
            Order Items
          </h2>

          <div className="bg-white rounded-xl border divide-y">
            {order.items.map((item) => (
              <div
                key={item._id || item.menuItem} // Backend item id
                className="flex items-center gap-3 px-4 py-3"
              >
                {/* Image is not stored in Order Item schema generally to save space? 
                    Unless we populated it.
                    Order model: items[{ menuItem: {type: ObjectId, ref: 'MenuItem'}, name, price, qty }] 
                    We didn't populate 'items.menuItem' in getOrderById yet.
                    So we might not have the image URL if it's on the MenuItem doc.
                    For MVP, show placeholder or name only.
                */}
                <div className="w-14 h-14 bg-gray-100 rounded-lg flex items-center justify-center text-xs text-gray-400">
                  IMG
                </div>

                <div className="flex-1">
                  <p className="text-sm font-medium">
                    {item.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    Qty: {item.qty}
                  </p>
                </div>

                <p className="text-sm font-semibold">
                  ₹{item.price * item.qty}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ================= BILL SUMMARY ================= */}
        <section className="px-4 mt-6">
          <div className="bg-white rounded-xl border p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>₹{calculatedSubtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax (10%)</span>
              <span>₹{calculatedTax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span>₹{order.totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </section>

        {/* ================= STICKY CTA ================= */}
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white px-4 py-4 border-t">
          <button
            onClick={() => navigate("/menu")}
            className="w-full bg-orange-500 text-white py-4 rounded-xl font-semibold active:scale-95 transition"
          >
            Main Menu
          </button>
        </div>
      </div>
    </PageWrapper>
  );
}

/* ======================================================
   STATUS TIMELINE
====================================================== */

import ReadyIcon from "../assets/ready_icon.png";

/* ... imports ... */

function StatusTimeline({ currentStatus = "pending" }) {
  const isKitchen = ['preparing', 'ready', 'ontheway', 'delivered'].includes(currentStatus);
  const isReady = ['ready', 'ontheway', 'delivered'].includes(currentStatus);
  const isServed = ['delivered'].includes(currentStatus);

  const steps = [
    {
      title: "Order Received",
      subtitle: "We’ve got your order",
      iconType: "lucide",
      icon: CheckCircle,
      active: true // Always true if order exists
    },
    {
      title: "In Kitchen",
      subtitle: "Being prepared",
      iconType: "lucide",
      icon: ChefHat,
      active: isKitchen
    },
    {
      title: "Ready",
      subtitle: "Your order is ready to be served",
      iconType: "image",
      image: ReadyIcon,
      active: isReady
    },
    {
      title: "Served",
      subtitle: "Enjoy your meal!",
      iconType: "lucide",
      icon: Smile,
      active: isServed
    }
  ];
  /* ... rest of component ... */

  return (
    <div className="relative">
      <div className="absolute left-4 top-0 h-full w-[2px] bg-gray-200">
        <div className="h-1/2 bg-orange-500 transition-all duration-700" />
      </div>

      <div className="space-y-6">
        {steps.map((step, idx) => (
          <StatusStep key={idx} {...step} />
        ))}
      </div>
    </div>
  );
}

/* ======================================================
   STATUS STEP
====================================================== */

function StatusStep({
  title,
  subtitle,
  iconType,
  icon: Icon,
  image,
  active
}) {
  return (
    <div className="flex items-start gap-4">
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center z-10 ${active ? "bg-orange-500" : "bg-gray-200"
          }`}
      >
        {iconType === "lucide" ? (
          <Icon
            size={16}
            className={active ? "text-white" : "text-gray-400"}
          />
        ) : (
          <img
            src={image}
            alt="Ready"
            className="w-4 h-4 object-contain"
          />
        )}
      </div>

      <div>
        <p
          className={`text-sm ${active ? "font-semibold" : "font-medium"
            }`}
        >
          {title}
        </p>
        <p className="text-xs text-gray-500">
          {subtitle}
        </p>
      </div>
    </div>
  );
}
