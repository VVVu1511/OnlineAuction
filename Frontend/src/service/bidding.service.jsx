import axios from "axios";

const instance = axios.create({
    baseURL: "http://localhost:3000/bidding",
    timeout: 20000, 
    validateStatus: () => true,
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

export async function getBidHistory(productId) {
    const res = await instance.get(`/bid_history/${productId}`);
    if (res.status === 201) return res.data;
    
    throw new Error("Error fetching bid history");
}

export async function getDeniedBidders(productId) {
    const res = await instance.get(`/denyBidder/${productId}`);
    
    if (res.status === 201 || res.status === 200) return res.data;

    throw new Error("Error fetching denied bidders");
}

export async function denyBidder(productId, bidderId) {
    const res = await instance.post(`/denyBidder/${productId}`, {
        bidderId,
    });

    if (res.status === 201) {
        return res.data;
    } else {
        throw new Error("Error denying bidder");
    }
}

export async function getMyBidding() {
    const res = await instance.get("/");
    if (res.status === 200) return res.data;
    throw new Error("Error fetching bidding list");
}

//rate bidder
export async function rateBidder(bidderId, productId, comment, rating) {
    const res = await instance.post("/rateBidder", {
        bidder_id: bidderId,
        product_id: productId,
        comment: comment,
        rating: rating
    });
    
    if (res.status === 201 || res.data === 200) return res.data;
    
    throw new Error("Error rating bidder");
}