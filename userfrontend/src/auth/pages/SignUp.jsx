import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PageWrapper from "../../components/PageWrapper";
import AuthLayout from "../layout/AuthLayout";
import InputField from "../components/InputField";
import PasswordInput from "../components/PasswordInput";
import PrimaryButton from "../components/PrimaryButton";
import SecondaryButton from "../components/SecondaryButton";
import Divider from "../components/Divider";
import api from "../../utils/api";
import { toast } from "react-hot-toast";

export default function Signup() {
  const navigate = useNavigate();

  /* ---------------- STATE ---------------- */
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [errors, setErrors] = useState({
    email: "",
    phone: "",
    password: "",
    confirm: "",
  });

  /* ---------------- STRICT INDUSTRY REGEX ---------------- */
  const EMAIL_REGEX =
    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,10}$/;

  const PHONE_REGEX = /^[6-9]\d{9}$/;

  const PASSWORD_REGEX =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,20}$/;

  /* ---------------- VALIDATION ---------------- */
  const validateEmail = (v) => {
    if (v.length > 254) return "Email must not exceed 254 characters";
    return EMAIL_REGEX.test(v)
      ? ""
      : "Enter a valid email address";
  };

  const validatePhone = (v) =>
    PHONE_REGEX.test(v)
      ? ""
      : "Enter a valid 10-digit mobile number";

  const validatePassword = (v) =>
    PASSWORD_REGEX.test(v)
      ? ""
      : "Password must be 8–20 chars with uppercase, lowercase, number & symbol";

  const validateConfirm = (v) =>
    v === password ? "" : "Passwords do not match";

  /* ---------------- CONFIRM PASSWORD SYNC ---------------- */
  useEffect(() => {
    if (confirm) {
      setErrors((prev) => ({
        ...prev,
        confirm: validateConfirm(confirm),
      }));
    }
  }, [password, confirm]);

  /* ---------------- HANDLERS ---------------- */

  const handleEmailChange = (e) => {
    const v = e.target.value;
    setEmail(v);
    setErrors((prev) => ({
      ...prev,
      email: v ? "" : "Email is required",
    }));
  };

  const handleEmailBlur = () => {
    setErrors((prev) => ({
      ...prev,
      email: email
        ? validateEmail(email.trim())
        : "Email is required",
    }));
  };

  const handlePhoneChange = (e) => {
    const v = e.target.value.replace(/\D/g, "");
    setPhone(v);
    setErrors((prev) => ({
      ...prev,
      phone: v ? validatePhone(v) : "Phone number is required",
    }));
  };

  const handlePasswordChange = (e) => {
    const v = e.target.value;
    setPassword(v);
    setErrors((prev) => ({
      ...prev,
      password: v ? validatePassword(v) : "Password is required",
    }));
  };

  const handleConfirmChange = (e) => {
    const v = e.target.value;
    setConfirm(v);
    setErrors((prev) => ({
      ...prev,
      confirm: v ? validateConfirm(v) : "Confirm your password",
    }));
  };

  /* ---------------- FORM VALID ---------------- */
  const isValid =
    email &&
    phone &&
    password &&
    confirm &&
    !errors.email &&
    !errors.phone &&
    !errors.password &&
    !errors.confirm;

  /* ---------------- SUBMIT ---------------- */
  /* ---------------- SUBMIT ---------------- */
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    const emailError = validateEmail(email.trim());
    if (emailError) {
      setErrors((prev) => ({ ...prev, email: emailError }));
      return;
    }

    if (!isValid) return;

    // Check if user exists
    setLoading(true);
    try {
      const { data } = await api.post('/auth/check-exists', {
        email: email.trim(),
        phone: phone.trim()
      });

      if (data.exists) {
        toast.error(data.message);
        if (data.message.includes("Email")) {
          setErrors(prev => ({ ...prev, email: data.message }));
        }
        if (data.message.includes("Phone")) {
          setErrors(prev => ({ ...prev, phone: data.message }));
        }
        return;
      }

      // Pass data to next step
      navigate("/profile-details", {
        state: {
          email,
          phone,
          password
        }
      });

    } catch (err) {
      console.error("Check failed", err);
      toast.error("Validation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper>
      <AuthLayout>
        <h1 className="text-lg font-bold text-center mb-8">
          Hotel Management
        </h1>

        <h2 className="text-base font-semibold text-center">
          Create an account
        </h2>
        <p className="text-sm text-gray-500 text-center mb-6">
          Enter your details to sign up
        </p>

        <div className="space-y-4">
          <InputField
            type="email"
            placeholder="email@domain.com"
            value={email}
            onChange={handleEmailChange}
            onBlur={handleEmailBlur}
            error={errors.email}
            maxLength={254}
          />

          <InputField
            type="tel"
            placeholder="Mobile Number"
            value={phone}
            onChange={handlePhoneChange}
            error={errors.phone}
            maxLength={10}
            inputMode="numeric"
          />

          <PasswordInput
            placeholder="Password"
            value={password}
            onChange={handlePasswordChange}
            error={errors.password}
          />

          <PasswordInput
            placeholder="Confirm Password"
            value={confirm}
            onChange={handleConfirmChange}
            error={errors.confirm}
          />
        </div>

        <div className="mt-6">
          <PrimaryButton
            text={loading ? "Checking..." : "Continue"}
            disabled={!isValid || loading}
            onClick={handleSubmit}
          />
        </div>

        <Divider />

        <SecondaryButton
          text="Sign In"
          onClick={() => navigate("/login")}
        />

        <p className="text-xs text-gray-400 text-center mt-4 leading-relaxed">
          By clicking continue, you agree to our{" "}
          <span className="text-black font-medium">Terms of Service</span>{" "}
          and{" "}
          <span className="text-black font-medium">Privacy Policy</span>
        </p>
      </AuthLayout>
    </PageWrapper>
  );
}
