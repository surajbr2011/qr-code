import { useState, useEffect } from "react";
import api from "../utils/api";

export default function PromoCode({ subtotal, onApply, autoCode }) {
    const [code, setCode] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);
    const [hasAutoApplied, setHasAutoApplied] = useState(false);

    // Auto-apply logic
    useEffect(() => {
        if (autoCode && !hasAutoApplied && subtotal > 0) {
            setCode(autoCode);
            validateCode(autoCode);
            setHasAutoApplied(true);
        }
    }, [autoCode, subtotal]);

    const validateCode = async (codeToTest) => {
        setError("");
        setSuccess("");
        setLoading(true);

        try {
            const { data } = await api.post('/promocodes/validate', {
                code: codeToTest,
                subtotal: subtotal
            });

            if (data.success) {
                onApply(data.discountAmount, codeToTest);
                setSuccess(`"${codeToTest}" applied! You saved ₹${data.discountAmount}`);
                sessionStorage.removeItem("autoApplyPromo"); // Clear after applying
            }
        } catch (err) {
            console.error(err);
            const msg = err.response?.data?.message || "Invalid promo code";
            setError(msg);
            onApply(0, ""); // Reset discount on error
        } finally {
            setLoading(false);
        }
    };

    const applyCode = () => validateCode(code);

    return (
        <div className="bg-white rounded-xl p-4 space-y-3 text-sm border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-800">Have a Promo Code?</h3>
            <div className="flex gap-2">
                <input
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="Enter code"
                    className="flex-1 border rounded-lg px-3 py-2 outline-none focus:border-orange-500 transition"
                />

                <button
                    onClick={applyCode}
                    disabled={loading || !code}
                    className="bg-orange-500 text-white px-4 py-2 rounded-lg font-semibold disabled:bg-gray-300 transition"
                >
                    {loading ? "..." : "Apply"}
                </button>
            </div>

            {error && <p className="text-red-500 text-xs font-medium">{error}</p>}
            {success && <p className="text-green-600 text-xs font-medium">{success}</p>}
        </div>
    );
}
