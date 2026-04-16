import { io } from "socket.io-client";

// Initialize socket connection
// Should match the backend URL
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

const socket = io(SOCKET_URL, {
    auth: {
        token: localStorage.getItem("token") // User app likely uses 'token'
    },
    autoConnect: false, // Wait until we manually connect (e.g., after login)
    withCredentials: true, // If using cookies/sessions
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
});

// Debug logs
socket.on("connect", () => {
    console.log("User socket connected:", socket.id);
});

socket.on("connect_error", (error) => {
    console.error("User socket connection error:", error.message);
});

socket.on("disconnect", (reason) => {
    console.log("User socket disconnected:", reason);
});

// Helper to easy debug
socket.onAny((event, ...args) => {
    console.log("SOCKET EVENT (User):", event, args);
});

export default socket;
