import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import PageWrapper from "../../components/PageWrapper";
import AuthLayout from "../layout/AuthLayout";
import InputField from "../components/InputField";
import PrimaryButton from "../components/PrimaryButton";
import api from "../../utils/api";
import { toast } from "react-hot-toast";

export default function ProfileDetails() {
  const navigate = useNavigate();
  const locationState = useLocation().state || {};

  // State from previous step (Signup)
  const initialEmail = locationState.email || "";
  const initialPhone = locationState.phone || "";
  const password = locationState.password || "";

  const [email, setEmail] = useState(initialEmail);
  const [name, setName] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [contact, setContact] = useState(initialPhone);
  // Init table from QR scan if available
  // Init table from QR scan if available
  useEffect(() => {
    const scannedName = localStorage.getItem("qr_location_name");
    const scannedTable = localStorage.getItem("qr_table_id");
    const scannedRoom = localStorage.getItem("qr_room_id");

    // Priority: Name (formatted) > Room ID > Table ID
    let finalValue = "";
    if (scannedName && scannedName !== "undefined" && scannedName !== "null") {
      finalValue = scannedName;
    } else if (scannedRoom && scannedRoom !== "undefined" && scannedRoom !== "null") {
      finalValue = scannedRoom;
    } else if (scannedTable && scannedTable !== "undefined" && scannedTable !== "null") {
      finalValue = scannedTable;
    }

    if (finalValue) {
      setTableRoom(finalValue);
      setIsTableFixed(true);
    }
  }, []);

  const [tableRoom, setTableRoom] = useState("");
  const [isTableFixed, setIsTableFixed] = useState(false);
  const [formLocation, setLocation] = useState("");
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);

  // ... (rest of code) ...




  const [touched, setTouched] = useState({
    email: false,
    name: false,
    contact: false,
    tableRoom: false,
  });

  /* ================= VALIDATIONS ================= */

  const isEmailValid =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const isNameValid =
    /^[A-Za-z]+( [A-Za-z]+)*$/.test(name) && name.length <= 26;

  const isContactValid =
    countryCode === "+91"
      ? /^[0-9]{10}$/.test(contact)
      : /^[0-9]{6,15}$/.test(contact);

  const isTableValid = tableRoom.trim().length > 0; // Allow any non-empty table/room identifier

  const isFormValid =
    isEmailValid && isNameValid && isContactValid && isTableValid;

  /* ================= HANDLERS ================= */

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handleNameChange = (e) => {
    let value = e.target.value
      .replace(/[^A-Za-z ]/g, "")
      .replace(/\s+/g, " ");
    if (value.length <= 26) setName(value);
  };

  const handleContactChange = (e) => {
    const digits = e.target.value.replace(/[^0-9]/g, "");

    // 🔒 Swiggy/Zomato style hard limit
    if (countryCode === "+91" && digits.length > 10) return;

    setContact(digits);
  };

  const handleContinue = async () => {
    setTouched({
      email: true,
      name: true,
      contact: true,
      tableRoom: true,
    });

    if (!isFormValid) return;

    try {
      setLoading(true);
      // Prepare payload for /auth/register
      // Backend expects: name, password, email (optional), phone (optional)
      // We also have tableRoom and location data to handle?
      // Usually auth just creates user. Extra details might need another call or be stored in user profile.
      // Let's assume for now we just register the user.
      // If the backend doesn't support table/room in register, we might lose it unless we send it.
      // Looking at typical structure: name, email, password are key.

      const payload = {
        name,
        password,
        email,
        phone: contact, // assuming contact is the phone number
        // if backend supports extra metadata in register, add it here
        tableNumber: tableRoom,
        location: formLocation
      };

      const { data } = await api.post('/auth/register', payload);

      console.log("Registration success:", data);
      toast.success("Account created successfully!");

      // Auto-login / Store token
      const { token, refreshToken } = data;
      if (token) {
        login(data, token, refreshToken);
      }

      navigate("/menu");

    } catch (err) {
      console.error("Registration invalid:", err);
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper>
      <AuthLayout>
        <h2 className="text-xl font-semibold text-center mb-8">
          Hotel Management
        </h2>

        <div className="space-y-4">

          {/* EMAIL */}
          <InputField
            placeholder="email@domain.com"
            value={email}
            onChange={handleEmailChange}
            onBlur={() =>
              setTouched((t) => ({ ...t, email: true }))
            }
          />
          {touched.email && !isEmailValid && (
            <p className="text-xs text-red-500">
              Enter a valid email address
            </p>
          )}

          {/* NAME */}
          <InputField
            placeholder="Name"
            value={name}
            onChange={handleNameChange}
            onBlur={() =>
              setTouched((t) => ({ ...t, name: true }))
            }
          />
          {touched.name && !isNameValid && (
            <p className="text-xs text-red-500">
              Name should contain only letters (max 26 characters)
            </p>
          )}

          {/* CONTACT */}
          <div className="flex gap-2">
            <select
              value={countryCode}
              onChange={(e) => {
                setCountryCode(e.target.value);
                setContact("");
              }}
              className="w-28 border rounded-lg px-2 py-2 text-sm"
            >
              <option value="+91">🇮🇳 +91</option>
              <option value="+1">🇺🇸 +1</option>
              <option value="+44">🇬🇧 +44</option>
            </select>

            <InputField
              placeholder="Mobile Number"
              value={contact}
              onChange={handleContactChange}
              onBlur={() =>
                setTouched((t) => ({ ...t, contact: true }))
              }
            />
          </div>
          {touched.contact && !isContactValid && (
            <p className="text-xs text-red-500">
              Enter a valid mobile number
            </p>
          )}

          {/* TABLE */}
          <InputField
            placeholder="Table / Room Number"
            value={tableRoom}
            onChange={(e) =>
              !isTableFixed && setTableRoom(
                e.target.value.replace(/[^a-zA-Z0-9-]/g, "")
              )
            }
            onBlur={() =>
              setTouched((t) => ({ ...t, tableRoom: true }))
            }
            readOnly={isTableFixed}
            className={isTableFixed ? "bg-gray-100 cursor-not-allowed opacity-70" : ""}
          />
          {touched.tableRoom && !isTableValid && (
            <p className="text-xs text-red-500">
              Table / Room number is required
            </p>
          )}

          {/* LOCATION */}
          <InputField
            placeholder="Location (Optional)"
            value={formLocation}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>

        <div className="mt-6">
          <PrimaryButton
            text={loading ? "Creating Account..." : "Continue"}
            onClick={handleContinue}
            disabled={!isFormValid || loading}
          />
        </div>
      </AuthLayout>
    </PageWrapper>
  );
}
