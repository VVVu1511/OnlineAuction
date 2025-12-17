import axios from "axios";

const instance = axios.create({
    baseURL: "http://localhost:3000/account",
    timeout: 20000,
});

instance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        config.headers["Content-Type"] = "application/json";
        return config;
    },
    (error) => Promise.reject(error)
);

// AUTH
export const login = (email, password) =>
    instance.post("/login", { email, password }).then(res => res.data);

export const register = (userData) =>
    instance.post("/register", userData).then(res => res.data);

export const sendOtp = (email) =>
    instance.post("/send-otp", { email }).then(res => res.data);

export const verifyOtp = (email, otp) =>
    instance.post("/verify-otp", { email, otp }).then(res => res.data);

// PROFILE
export const getProfile = () =>
    instance.get("/profile").then(res => res.data);

export const updateProfile = (payload) =>
    instance.put("/update", payload).then(res => res.data);

export const sendUpgradeRequest = () =>
    instance.post("/upgrade").then(res => res.data);

// DATA
export const getWatchlist = () =>
    instance.get("/watchlist").then(res => res.data);

export const getRatings = () =>
    instance.get("/rating").then(res => res.data);

export const getWonProducts = () =>
    instance.get("/win").then(res => res.data);

// ADMIN
export const getAllAccounts = () =>
    instance.get("/all").then(res => res.data);

export const handleAccountAction = (id, action) =>
    instance.put(`/${action}/${id}`).then(res => res.data);

export const deleteUser = (id) =>
    instance.delete(`/${id}`, { data: { id } }).then(res => res.data);
