import { io } from "socket.io-client";

// Initialize socket connection
// Should match the backend URL
const URL = "http://localhost:5001";

const socket = io(URL, {
    autoConnect: false, // Wait until we manually connect (e.g., after login)
    withCredentials: true, // If using cookies/sessions
});

// Helper to easy debug
socket.onAny((event, ...args) => {
    console.log("SOCKET EVENT:", event, args);
});

export default socket;
