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
export async function login(email, password) {
    const res = await instance.post("/login", { email, password });
    if (res.status === 200 || res.status === 201) return res.data;
    throw new Error("Login failed");
}

export async function register(userData) {
    const res = await instance.post("/register", userData);
    if (res.status === 200 || res.status === 201) return res.data;
    throw new Error("Register failed");
}

export async function sendOtp(email) {
    const res = await instance.post("/send-otp", { email });
    if (res.status === 200 || res.status === 201) return res.data;
    throw new Error("Send OTP failed");
}

export async function verifyOtp(email, otp) {
    const res = await instance.post("/verify-otp", { email, otp });
    if (res.status === 200 || res.status === 201) return res.data;
    throw new Error("Verify OTP failed");
}

// PROFILE
export async function getProfile() {
    const res = await instance.get("/profile");

    if (res.status === 201) return res.data;
    throw new Error("Error fetching profile");
}

export async function sendUpgradeRequest() {
    const res = await instance.post("/upgrade");
    if (res.status === 200 || res.status === 201) return res.data;
    throw new Error("Upgrade request failed");
}

// DATA
export async function getWatchlist() {
    const res = await instance.get("/watchlist");
    if (res.status === 201) return res.data;
    throw new Error("Error fetching watchlist");
}

export async function getRatings() {
    const res = await instance.get("/rating");
    if (res.status === 201) return res.data;
    throw new Error("Error fetching ratings");
}

export async function getWonProducts() {
    const res = await instance.get("/win");
    if (res.status === 201) return res.data;
    throw new Error("Error fetching won products");
}

// ADMIN
export async function getAllAccounts() {
    const res = await instance.get("/all");
    if (res.status === 201) return res.data;
    throw new Error("Error fetching accounts");
}

export async function handleAccountAction(id, action) {
    const res = await instance.put(`/${action}/${id}`);
    if (res.status === 201) return res.data;
    throw new Error("Account action failed");
}

export async function deleteUser(id) {
    const res = await instance.delete(`/${id}`, { data: { id } });
    if (res.status === 201) return res.data;
    throw new Error("Delete user failed");
}

//change password
export async function changePassword(payload, id) {
    const res = await instance.put(`/change-password/${id}`, payload);

    return res.data;
}

//update profile
export async function updateProfile(payload,id) {
    const res = await instance.put(`/profile/${id}`, payload);

    if (res.status === 201 || res.status === 200) return res.data;
    
    throw new Error("Update profile failed");
}

//getAllUsers
export async function getAllUsers() {
    const res = await instance.get("/all");
    
    if (res.status === 201 || res.status === 200) return res.data;

    throw new Error("Error fetching users");
}

