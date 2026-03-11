import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import PageWrapper from "../components/PageWrapper";
import api from "../utils/api";
import { useTheme } from "../context/ThemeContext";
import { FiArrowLeft, FiShield, FiSmartphone, FiCreditCard, FiDollarSign, FiCheckCircle } from "react-icons/fi";
import { SiGooglepay, SiPhonepe, SiPaytm } from "react-icons/si";
import toast from "react-hot-toast";

// Load Razorpay Script Utility
const loadRazorpayScript = () => {
    return new Promise((resolve) => {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
};

export default function Payment() {
    const navigate = useNavigate();
    const location = useLocation();
    const { theme, isAvengerMode } = useTheme();
    const orderId = location.state?.orderId;

    const [loading, setLoading] = useState(false);
    const [orderDetail, setOrderDetail] = useState(null);
    const [selectedMethod, setSelectedMethod] = useState("upi"); // default

    // Multi-order support
    const consolidatedOrders = location.state?.consolidatedOrders || null;
    const isConsolidated = !!consolidatedOrders;

    useEffect(() => {
        if (!orderId && !consolidatedOrders) {
            toast.error("No invoice found");
            navigate("/cart");
            return;
        }

        if (isConsolidated) {
            // Calculate total from passed orders
            const total = consolidatedOrders.reduce((sum, o) => sum + o.totalAmount, 0);
            setOrderDetail({
                _id: "consolidated", // Dummy ID
                totalAmount: total,
                customerInfo: consolidatedOrders[0]?.guestInfo || {}
            });
        } else {
            const fetchOrder = async () => {
                try {
                    const { data } = await api.get(`/orders/${orderId}`);
                    setOrderDetail(data);
                } catch (err) {
                    console.error("Failed to fetch order", err);
                    toast.error("Error loading order details");
                }
            };
            fetchOrder();
        }
    }, [orderId, consolidatedOrders, navigate]);

    const handleCODPayment = async () => {
        setLoading(true);
        try {
            if (isConsolidated) {
                // Confirm all orders
                await Promise.all(consolidatedOrders.map(order =>
                    api.put(`/orders/${order._id}`, {
                        paymentStatus: 'pending',
                        paymentMethod: 'cod',
                        status: 'confirm'
                    })
                ));
            } else {
                await api.put(`/orders/${orderId}`, {
                    paymentStatus: 'pending',
                    paymentMethod: 'cod',
                    status: 'confirm'
                });
            }
            toast.success("Bill confirmed with COD!");
            navigate("/order-tracking", { state: { orderId: isConsolidated ? consolidatedOrders[0]._id : orderId } });
        } catch (err) {
            toast.error("Failed to confirm COD");
        } finally {
            setLoading(false);
        }
    };

    const handleSimulation = () => {
        // Mock success for all
        const promises = isConsolidated
            ? consolidatedOrders.map(o => api.post('/payments/simulate-success', { orderId: o._id }))
            : [api.post('/payments/simulate-success', { orderId })];

        Promise.all(promises)
            .then(() => {
                toast.success("Payment Simulated!");
                navigate("/order-tracking", { state: { orderId: isConsolidated ? consolidatedOrders[0]._id : orderId } });
            })
            .catch(err => toast.error("Simulation Failed"));
    };

    const handleRazorpayPayment = async (method = 'upi') => {
        if (!orderDetail) return;

        setLoading(true);
        const res = await loadRazorpayScript();

        if (!res) {
            toast.error("Razorpay SDK failed to load. Are you online?");
            setLoading(false);
            return;
        }

        try {
            // 1. Create Order in Razorpay via our backend
            const { data: razorpayOrder } = await api.post("/razorpay/order", {
                amount: orderDetail.totalAmount,
                currency: "INR",
                receipt: `receipt_${isConsolidated ? 'bill' : orderId}`
            });

            // HANDLE MOCK ORDER (If backend says simulation mode)
            if (razorpayOrder.is_mock) {
                const proceed = window.confirm("⚠️ Test Mode: Razorpay keys missing on server.\n\nSimulate successful payment?");
                if (proceed) {
                    handleSimulation();
                } else {
                    setLoading(false);
                }
                return;
            }

            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_YourKeyHere",
                amount: razorpayOrder.amount,
                currency: razorpayOrder.currency,
                name: "CINNAMON AGONDA",
                description: "Restaurant Bill Payment",
                image: "https://your-logo-url.com/logo.png",
                order_id: razorpayOrder.id,
                handler: async function (response) {
                    try {
                        const targetOrderIds = isConsolidated ? consolidatedOrders.map(o => o._id) : orderId;

                        const verifyRes = await api.post("/razorpay/verify", {
                            ...response,
                            orderId: targetOrderIds, // Pass array or string
                            paymentMethod: 'upi'
                        });

                        if (verifyRes.status === 200) {
                            toast.success("Payment Successful! 🚀");
                            navigate("/order-tracking"); // Just go to tracking, maybe consolidated view later?
                        }
                    } catch (err) {
                        toast.error("Payment Verification Failed!");
                        console.error(err);
                    }
                },
                prefill: {
                    name: orderDetail.customerInfo?.name || "Guest",
                    email: orderDetail.customerInfo?.email || "",
                    contact: orderDetail.customerInfo?.phone || "",
                },
                theme: { color: "#f97316" },
                config: {
                    display: {
                        blocks: {
                            banks: {
                                name: 'Most Used UPI',
                                instruments: [
                                    { method: 'upi', upi_app: 'google_pay' },
                                    { method: 'upi', upi_app: 'phonepe' },
                                    { method: 'upi', upi_app: 'paytm' },
                                ],
                            }
                        },
                        sequence: ['block.banks', 'block.other'],
                        preferences: { show_default_blocks: true }
                    }
                }
            };

            const paymentObject = new window.Razorpay(options);
            paymentObject.open();

        } catch (err) {
            console.error("Razorpay Error:", err);
            toast.error("Could not initiate payment. Using simulation fallback.");
            // Simulation fallback if backend endpoint fails
            handleSimulation();
        } finally {
            setLoading(false);
        }
    };

    const processPayment = () => {
        if (selectedMethod === 'cod') {
            handleCODPayment();
        } else {
            handleRazorpayPayment(selectedMethod);
        }
    };

    return (
        <PageWrapper className={`min-h-screen pb-32 max-w-[430px] mx-auto font-sans transition-colors duration-500 ${theme.bg}`}>
            {/* Header */}
            <header className={`sticky top-0 z-20 border-b px-4 h-16 flex items-center justify-between shadow-sm transition-colors duration-500 ${theme.headerBg} ${theme.border}`}>
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className={`p-2 rounded-full transition ${isAvengerMode ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-gray-50 text-gray-900'}`}>
                        <FiArrowLeft size={22} />
                    </button>
                    <h1 className={`text-lg font-bold ${theme.text}`}>Payment</h1>
                </div>
                <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${isAvengerMode ? 'bg-red-900/40 text-red-400' : 'bg-orange-50 text-orange-500'}`}>
                    Secured
                </div>
            </header>

            <div className="p-4 space-y-6">
                {/* Bill Card */}
                <div className={`rounded-3xl p-6 shadow-sm border ${theme.cardBg} ${theme.border}`}>
                    <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-4 ${theme.textSec}`}>Final Amount</p>
                    <div className="flex items-baseline gap-1">
                        <span className={`text-4xl font-black ${theme.text}`}>₹{orderDetail?.totalAmount.toFixed(2)}</span>
                        <span className={`text-xs font-bold ${theme.textSec}`}>Total Bill</span>
                    </div>
                </div>

                {/* UPI Shortcuts (Zomato Style) */}
                <div>
                    <h3 className={`text-xs font-black uppercase tracking-widest mb-3 ml-1 ${theme.textSec}`}>Pay with UPI Apps</h3>
                    <div className="grid grid-cols-3 gap-3">
                        <UPIShortcut
                            icon={<SiGooglepay size={24} className="text-[#4285F4]" />}
                            label="GPay"
                            onClick={() => handleRazorpayPayment('upi')}
                            theme={theme}
                            isAvengerMode={isAvengerMode}
                        />
                        <UPIShortcut
                            icon={<SiPhonepe size={24} className="text-[#5f259f]" />}
                            label="PhonePe"
                            onClick={() => handleRazorpayPayment('upi')}
                            theme={theme}
                            isAvengerMode={isAvengerMode}
                        />
                        <UPIShortcut
                            icon={<SiPaytm size={32} className="text-[#00B9F1]" />}
                            label="Paytm"
                            onClick={() => handleRazorpayPayment('upi')}
                            theme={theme}
                            isAvengerMode={isAvengerMode}
                        />
                    </div>
                </div>

                {/* All Options */}
                <div>
                    <h3 className={`text-xs font-black uppercase tracking-widest mb-3 ml-1 ${theme.textSec}`}>All Payment Methods</h3>
                    <div className={`rounded-3xl p-2 shadow-sm border divide-y ${theme.cardBg} ${theme.border} ${isAvengerMode ? 'divide-slate-700' : 'divide-gray-50'}`}>
                        <PaymentOption
                            id="upi"
                            icon={<FiSmartphone className="text-blue-500" />}
                            title="UPI Apps"
                            desc="Google Pay, PhonePe, Paytm"
                            selected={selectedMethod === 'upi'}
                            onSelect={() => setSelectedMethod('upi')}
                            theme={theme}
                            isAvengerMode={isAvengerMode}
                        />
                        <PaymentOption
                            id="card"
                            icon={<FiCreditCard className="text-purple-500" />}
                            title="Cards"
                            desc="Debit, Credit & Corporate cards"
                            selected={selectedMethod === 'card'}
                            onSelect={() => setSelectedMethod('card')}
                            theme={theme}
                            isAvengerMode={isAvengerMode}
                        />
                        <PaymentOption
                            id="cod"
                            icon={<FiDollarSign className="text-green-500" />}
                            title="Cash on Delivery"
                            desc="Pay at the restaurant"
                            selected={selectedMethod === 'cod'}
                            onSelect={() => setSelectedMethod('cod')}
                            theme={theme}
                            isAvengerMode={isAvengerMode}
                        />
                    </div>
                </div>

                {/* Trust Shield */}
                <div className="flex items-center justify-center gap-2 py-4 grayscale opacity-40">
                    <FiShield size={14} className={isAvengerMode ? 'text-slate-500' : 'text-gray-500'} />
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${isAvengerMode ? 'text-slate-500' : 'text-gray-500'}`}>PCI DSS Compliant Payment Environment</span>
                </div>
            </div>

            {/* Bottom Button */}
            <div className={`fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] border-t p-4 z-30 ${isAvengerMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-gray-100'}`}>
                <button
                    onClick={processPayment}
                    disabled={loading || !orderDetail}
                    className={`w-full py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-3 active:scale-[0.98] transition-transform disabled:opacity-50
                        ${isAvengerMode
                            ? 'bg-gradient-to-r from-red-700 to-red-900 text-white shadow-lg shadow-red-900/40'
                            : 'bg-black text-white'}`}
                >
                    {loading ? (
                        <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                    ) : (
                        <>
                            <span>Pay ₹{orderDetail?.totalAmount.toFixed(2)}</span>
                            <FiCheckCircle />
                        </>
                    )}
                </button>
            </div>
        </PageWrapper>
    );
}

function UPIShortcut({ icon, label, onClick, theme, isAvengerMode }) {
    return (
        <button
            onClick={onClick}
            className={`border rounded-2xl p-4 flex flex-col items-center justify-center gap-2 shadow-sm active:scale-95 transition
                ${isAvengerMode
                    ? 'bg-slate-800 border-slate-700 hover:bg-slate-700'
                    : 'bg-white border-gray-100 hover:bg-gray-50'}`}
        >
            <div className="h-8 flex items-center justify-center">{icon}</div>
            <span className={`text-[10px] font-bold ${theme.textSec}`}>{label}</span>
        </button>
    );
}

function PaymentOption({ id, icon, title, desc, selected, onSelect, theme, isAvengerMode }) {
    return (
        <label
            className={`flex items-center gap-4 p-4 cursor-pointer transition-colors 
                ${selected
                    ? (isAvengerMode ? 'bg-slate-700/50' : 'bg-orange-50/50')
                    : (isAvengerMode ? 'hover:bg-slate-800' : 'hover:bg-gray-50')}`}
            onClick={onSelect}
        >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl transition-all 
                ${selected
                    ? (isAvengerMode ? 'bg-slate-700 shadow-sm scale-110' : 'bg-white shadow-sm scale-110')
                    : (isAvengerMode ? 'bg-slate-800' : 'bg-gray-50')}`}>
                {icon}
            </div>
            <div className="flex-1">
                <p className={`text-sm font-bold ${theme.text}`}>{title}</p>
                <p className={`text-[10px] font-medium ${theme.textSec}`}>{desc}</p>
            </div>
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all 
                ${selected
                    ? (isAvengerMode ? 'border-red-500 bg-red-500' : 'border-orange-500 bg-orange-500')
                    : (isAvengerMode ? 'border-slate-600' : 'border-gray-200')}`}>
                {selected && <div className="w-2 h-2 rounded-full bg-white" />}
            </div>
        </label>
    );
}
