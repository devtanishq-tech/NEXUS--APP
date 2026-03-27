import axios from "axios";

// ── Base instance ────────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000",
  withCredentials: true, // Send cookies on every request
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// ── Request interceptor ──────────────────────────────────────────────────────
api.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error),
);

// ── Response interceptor ─────────────────────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;

    // Session expired or unauthorized → redirect to login
    if (status === 401) {
      if (
        window.location.pathname !== "/login" &&
        window.location.pathname !== "/signup"
      ) {
        window.location.href = "/login";
      }
    }

    // Shape a consistent error message
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "An unexpected error occurred.";

    return Promise.reject(new Error(message));
  },
);

// ── Auth API ─────────────────────────────────────────────────────────────────
export const authAPI = {
  login: (data) => api.post("/api/auth/login", data),
  signup: (data) => api.post("/api/auth/signup", data),
  logout: () => api.get("/logout"),
  getCurrentUser: () => api.get("/api/auth/user"),
};

// ── Data API ─────────────────────────────────────────────────────────────────
export const dataAPI = {
  getAll: (params = {}) => api.get("/api/data", { params }),
  create: (payload) => api.post("/api/data", payload),
  update: (id, payload) => api.put(`/api/data/${id}`, payload),
  delete: (id) => api.delete(`/api/data/${id}`),
};

export default api;
