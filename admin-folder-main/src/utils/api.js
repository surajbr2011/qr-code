import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "https://qr-code-uuun.onrender.com/api",
});

// Request Interceptor: Attach Token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("admin_token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor: Handle Auth Errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Token expired or invalid
            localStorage.removeItem("admin_token");
            localStorage.removeItem("admin_user");
            window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);

export default api;
