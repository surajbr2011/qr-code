import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../utils/api";
import { toast } from "react-hot-toast";

export default function Landing() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        const token = searchParams.get("token");

        if (token) {
            handleScan(token);
        } else {
            // Auto-redirect if already logged in
            const savedToken = localStorage.getItem("customer_token");
            if (savedToken) {
                navigate("/menu", { replace: true });
            }
        }
    }, []);

    const [manualToken, setManualToken] = useState("");

    const handleScan = async (tokenOrUrl) => {
        if (!tokenOrUrl) return;

        let token = tokenOrUrl;
        // Extract token if full URL is scanned
        try {
            const trimmed = tokenOrUrl.trim();
            if (trimmed.includes("token=")) {
                // Handle cases where it might be a partial URL or full URL
                const searchStr = trimmed.split('?')[1] || trimmed;
                const params = new URLSearchParams(searchStr);
                token = params.get("token") || token;
            } else {
                token = trimmed;
            }
        } catch (e) {
            token = tokenOrUrl.trim();
        }

        try {
            // 1. Verify Token with Backend
            const { data } = await api.post('/qrcodes/verify-scan', { token });

            if (data.valid) {
                // 2. Store Table Info (Clear old first)
                localStorage.removeItem("qr_table_id");
                localStorage.removeItem("qr_room_id");
                localStorage.removeItem("qr_location_name");

                if (data.tableId) localStorage.setItem("qr_table_id", data.tableId);
                if (data.roomId) localStorage.setItem("qr_room_id", data.roomId);

                const tName = data.tableName;
                if (tName) localStorage.setItem("qr_location_name", tName);

                toast.success(`Welcome! Your location is set: ${tName || data.tableId || data.roomId}`);

                // 3. Redirect: If logged in go to menu, else signup
                const custToken = localStorage.getItem("customer_token");
                if (custToken) {
                    // Sync new table/room to database profile for consistency across staff/admin
                    try {
                        await api.put('/auth/profile', {
                            tableRoom: data.tableName || data.tableId || data.roomId
                        });
                    } catch (syncErr) {
                        console.error("Profile location sync failed:", syncErr);
                    }
                    navigate("/menu", { replace: true });
                } else {
                    navigate("/login", { replace: true });
                }
            }
        } catch (err) {
            console.error("Invalid QR:", err);
            toast.error("Invalid or Expired QR Code");
        }
    };

    return (
        <div className="h-screen flex flex-col items-center justify-center bg-gray-50 p-6 relative">

            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-sm text-center">
                <div className="w-16 h-16 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                    </svg>
                </div>
                <h1 className="text-xl font-bold text-gray-900 mb-2">Scan QR Code</h1>
                <p className="text-gray-500 text-sm mb-6">Please scan the QR code on your table to verify and continue.</p>

                {/* Manual Input Removed as per request */}
            </div>
        </div>
    );
}
