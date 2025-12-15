import axios from "axios";

const instance = axios.create({
    baseURL: "http://localhost:3000/account",
    timeout: 20000
});

// Interceptor gắn token
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

export async function login(email, password){
    const res = await instance.post("/login", {
        email,
        password,
        });
    if(res.status === 200){
        return res.data;
    } else {
        throw new Error("Error log in");
    }
};

export async function getProfile(){
    const res = await instance.get("/profile");
    if(res.status === 200){
        return res.data;
    } else {
        throw new Error("Error get profile");
    }
};

export async function verifyOtp(email, otp){
    const res = await instance.post("/verify-otp",{
        email,
        otp,
    });
    if(res.status === 200){
        return res.data;
    } else {
        throw new Error("Error verifying OTP");
    }
};

export async function register(userData){
    const res = await instance.post("/register",{
        userData
    });
    if(res.status === 200){
        return res.data;
    } else {
        throw new Error("Error registering");
    }
};

export async function getWatchlist(){
    const res = await instance.get("/watchlist");
    if(res.status === 200){
        return res.data;
    } else {
        throw new Error("Error getting watch list");
    }
};

export async function getRatings() {
    const res = await instance.get("/rating");
    if (res.status === 200) return res.data;
    throw new Error("Error fetching ratings");
}

export async function getWatchlist() {
    const res = await instance.get("/watchlist");
    if (res.status === 200) return res.data;
    throw new Error("Error fetching watchlist");
}

export async function getWonProducts() {
    const res = await instance.get("/win");
    if (res.status === 200) return res.data;
    throw new Error("Error fetching won products");
}

export async function updateProfile(payload) {
    const res = await instance.put("/update", payload);

    if (res.status === 200) return res.data;

    throw new Error("Error updating profile");
}

export async function sendUpgradeRequest() {
    const res = await instance.post("/upgrade");

    if (res.status === 200) return res.data;

    throw new Error("Error sending upgrade request");
}

export async function sendOtp(email) {
    const res = await instance.post("/send-otp", { email });

    if (res.status === 200) {
        return res.data;
    }
    throw new Error("Send OTP failed");
}

export async function getWatchlist() {
    const res = await instance.get("/watchlist");
    if (res.status === 200) return res.data;
    throw new Error("Error fetching watchlist");
}

export async function getAllAccounts() {
    const res = await instance.get("/all");
    if (res.status === 200) return res.data;
    throw new Error("Error fetching accounts");
}

export async function handleAccountAction(id, action) {
    const res = await instance.put(`/${action}/${id}`);
    if (res.status === 200) return res.data;
    throw new Error("Account action failed");
}

export async function deleteUser(id) {
    const res = await instance.delete(`/${id}`, {
        data: { id } 
    });

    if (res.status === 200) return res.data;
    throw new Error("Delete user failed");
}