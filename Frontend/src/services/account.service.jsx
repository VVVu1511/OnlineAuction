import axios from "axios";
import { ROLE } from "../constants/role";

const instance = axios.create({
    baseURL: "http://localhost:3000/account",
    timeout: 20000,
});

// AUTH
export const login = (email, password) =>
    instance.post("/login", { email, password }).then(res => res.data);

export const register = (data) =>
    instance.post("/register", data).then(res => res.data);

export const sendOtp = (email) =>
    instance.post("/send-otp", { email }).then(res => res.data);

export const verifyOtp = (email, otp) =>
    instance.post("/verify-otp", { email, otp }).then(res => res.data);

// PROFILE
export const getProfile = () =>
    instance.get("/profile").then(res => res.data);

export const updateProfile = (payload, id) =>
    instance.put(`/profile/${id}`, payload).then(res => res.data);

export const changePassword = (payload, id) =>
    instance.put(`/change-password/${id}`, payload).then(res => res.data);

// DATA
export const getWatchlist = (id) =>
    instance.get(`/watchlist/${id}`).then(res => res.data);

export const getRatings = (id) =>
    instance.get(`/rating/${id}`).then(res => res.data);

export const getWonProducts = (id) =>
    instance.get(`/win/${id}`).then(res => res.data);

// ADMIN
export const getAllUsers = () =>
    instance.get("/all").then(res => res.data);

export const handleAccountAction = (id, action) =>
    instance.put(`/${action}/${id}`).then(res => res.data);

export const deleteUser = (id) =>
    instance.delete(`/${id}`, { data: { id } }).then(res => res.data);

export const resetPassword = (email, newPassword) =>
    instance.put("/reset-password", {
        email,
        new_password: newPassword,
    }).then(res => res.data);

export const addUser = (data) =>
    instance.post("/add", {
        email: data.email,
        password: data.password,
        full_name: data.name,
        address: data.address,
        role: ROLE[data.role],
    }).then(res => res.data.data);


/* UPDATE USER */
export const updateUser = (id, data) => {
    instance
        .put(`/update/${id}`, {
            full_name: data.name,
            address: data.address,
            role: data.role,
        })
        .then(res => res.data.data);
};

export const getWatchlistState = async (user_id, product_id) => {
    const res = await instance.get(`/watchlist/${user_id}/${product_id}`);
    return res.data.data;
};

export const addWatchlist = async (user_id, product_id) => {
    const res = await instance.post("/watchlist/add", {
        user_id,
        product_id
    });
    return res.data.data;
};

export const removeWatchlist = async (user_id, product_id) => {
    const res = await instance.delete("/watchlist/remove", {
        data: { user_id, product_id }
    });
    return res.data.data;
};

export const requestSell = async (user_id) => {
    const res = await instance.put(`/requestSell/${user_id}`);
    return res.data;
};

export const getRequestSellState = async (user_id) => {
    const res = await instance.get(`/requestSell/${user_id}`);
    return res.data.data; 
};
