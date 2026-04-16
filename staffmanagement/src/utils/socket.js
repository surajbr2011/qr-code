import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

const socket = io(SOCKET_URL, {
    auth: {
        token: localStorage.getItem("staff_token")
    },
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
});

// Debug logs
socket.on("connect", () => {
    console.log("Staff socket connected:", socket.id);
});

socket.on("connect_error", (error) => {
    console.error("Staff socket connection error:", error.message);
});

socket.on("disconnect", (reason) => {
    console.log("Staff socket disconnected:", reason);
});

export default socket;
