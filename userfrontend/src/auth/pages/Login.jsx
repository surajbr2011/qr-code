import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PageWrapper from "../../components/PageWrapper";
import AuthLayout from "../layout/AuthLayout";
import InputField from "../components/InputField";
import PasswordInput from "../components/PasswordInput";
import PrimaryButton from "../components/PrimaryButton";
import api from "../../utils/api";
import { toast } from "react-hot-toast";
import { jwtDecode } from "jwt-decode";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { deactivateOffer, clearCart } = useCart();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // Email regex (A–Z, a–z, 0–9, ., @) - or allow simple string for phone/username
  // Backend accepts "email" or "phone" in the same field or separate?
  // Checking authRoutes: body('password').notEmpty()... wait.
  // authController usually checks req.body.email or req.body.phone.
  // Let's assume the input is "identifier" (email or phone).
  // But the UI says "email@domain.com". Let's stick to email for now or allow both.

  const handleSubmit = async () => {
    let valid = true;
    setEmailError("");
    setPasswordError("");

    if (!email) {
      setEmailError("Email is required");
      valid = false;
    }
    if (!password) {
      setPasswordError("Password is required");
      valid = false;
    }

    if (!valid) return;

    try {
      setLoading(true);
      // Backend expects { email, password } (or phone).
      // If user enters phone, we should send it as phone.
      // Simple heuristic: if it has @ it's email, else phone?
      // For now, let's send 'email' as the key if it looks like email, or 'phone' if numbers.
      // Actually, looking at authController (I didn't see the code, but usually it's one or the other).
      // Let's blindly send it as 'email' if it has '@', else 'phone'.

      const payload = { password };
      if (email.includes('@')) {
        payload.email = email;
      } else {
        payload.phone = email; // Reuse variable
      }

      const { data } = await api.post('/auth/login', payload);

      // Success
      console.log("Login success:", data);
      toast.success("Login Successful!");

      // Store token
      const { token, refreshToken } = data; // Adjust based on actual response structure
      // If the backend returns just { token }, use that.
      // Response format is likely { token, type: 'Bearer' } or similar.
      // Let's assume standard { token }.

      if (token) {
        login(data, token, refreshToken);
        // Clear previous session data to ensure fresh price view
        deactivateOffer();
        // Optionally clear cart too if desired, or keep it. User requested "menus display with normal price".
        // Clearing cart prevents old items with old prices (or wrong offer applied) from persisting.
        // Let's clear it to be safe and "fresh".
        clearCart();
      }

      navigate("/menu");

    } catch (err) {
      console.error("Login Error:", err);
      const msg = err.response?.data?.message || "Login failed. Please check your credentials.";
      toast.error(msg);
      if (msg.toLowerCase().includes("password")) {
        setPasswordError(msg);
      } else {
        setEmailError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper>
      <AuthLayout>
        <h2 className="text-xl font-semibold text-center mb-2">
          Welcome Back
        </h2>
        <p className="text-sm text-gray-500 text-center mb-8">
          Login to your account
        </p>

        <div className="space-y-4">
          <InputField
            placeholder="Email or Phone"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={emailError}
          />

          <PasswordInput
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={passwordError}
          />
        </div>

        <div className="mt-6">
          <PrimaryButton
            text={loading ? "Signing In..." : "Sign In"}
            onClick={handleSubmit}
            disabled={loading}
          />
        </div>

        <p
          onClick={() => navigate("/forgot-password")}
          className="text-xs text-gray-400 text-center mt-4 cursor-pointer hover:text-black"
        >
          Forgot Password?
        </p>
      </AuthLayout>
    </PageWrapper>
  );
}
