import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PageWrapper from "../../components/PageWrapper";
import AuthLayout from "../layout/AuthLayout";
import InputField from "../components/InputField";
import PrimaryButton from "../components/PrimaryButton";
import api from "../../utils/api";
import { toast } from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";

export default function GuestLogin() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const { clearCart } = useCart();

    const [phone, setPhone] = useState("");
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async () => {
        setError("");
        if (!phone) {
            setError("Phone number is required");
            return;
        }
        if (phone.length < 10) {
            setError("Please enter a valid phone number");
            return;
        }

        try {
            setLoading(true);

            const tableRoom = localStorage.getItem("qr_table_id");
            const location = localStorage.getItem("qr_location_name");

            const { data } = await api.post('/auth/guest-login', {
                phone,
                name,
                tableRoom,
                location
            });

            if (data.token) {
                login(data, data.token); // Assuming token is returned directly
                clearCart();
                toast.success(`Welcome, ${data.name}!`);
                navigate("/menu");
            }
        } catch (err) {
            console.error("Guest Login Error:", err);
            toast.error(err.response?.data?.message || "Login failed");
            setError(err.response?.data?.message || "Login failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <PageWrapper>
            <AuthLayout>
                <h2 className="text-xl font-semibold text-center mb-2">
                    Start Ordering
                </h2>
                <p className="text-sm text-gray-500 text-center mb-8">
                    Enter your phone number to continue
                </p>

                <div className="space-y-4">
                    <InputField
                        placeholder="Phone Number (Required)"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        error={error}
                    />

                    <InputField
                        placeholder="Your Name (Optional)"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>

                <div className="mt-6">
                    <PrimaryButton
                        text={loading ? "Verifying..." : "Continue"}
                        onClick={handleSubmit}
                        disabled={loading}
                    />
                </div>
            </AuthLayout>
        </PageWrapper>
    );
}
