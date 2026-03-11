import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5001";

const socket = io(SOCKET_URL, {
    auth: {
        token: localStorage.getItem("staff_token")
    },
    autoConnect: true
});

export default socket;
