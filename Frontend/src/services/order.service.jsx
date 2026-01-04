import axios from "axios";

const instance = axios.create({
    baseURL: "http://localhost:3000/order",
    timeout: 20000,
});

export const createOrder = async (productId, sellerId, winnerId) => {
    const res = await instance.post("/create", {
        product_id: productId,
        seller_id: sellerId,
        winner_id: winnerId,
    });
    return res.data;
};

export const submitPayment = async (
    productId,
    buyerId,
    paymentInfo,
    address
    ) => {
    const res = await instance.post(`/${productId}/payment`, {
        userId: buyerId,
        payment_info: paymentInfo,
        address,
    });
    return res.data;
};

export const confirmShipping = async (
    productId,
    sellerId,
    shippingInfo
    ) => {
    const res = await instance.post(`/${productId}/shipping`, {
        userId: sellerId,
        shipping_info: shippingInfo,
    });
    return res.data;
};

export const confirmReceive = async (productId, buyerId) => {
    const res = await instance.post(`/${productId}/confirm-receive`, {
        userId: buyerId,
    });
    return res.data;
};

export const submitReview = async (
    productId,
    reviewerId,
    score,
    comment
    ) => {
    const res = await instance.post(`/${productId}/review`, {
        userId: reviewerId,
        score,
        comment,
    });
    return res.data;
};

export const cancelOrder = async (productId, sellerId) => {
    const res = await instance.post(`/${productId}/cancel`, {
        userId: sellerId,
    });
    return res.data;
};

export const sendOrderMessage = async (
    productId,
    senderId,
    message
    ) => {
    const res = await instance.post(`/${productId}/chat`, {
        userId: senderId,
        message,
    });
    return res.data;
};

/**
 * Get order chat history
 */
export const getOrderChat = async (productId) => {
    const res = await instance.get(`/${productId}/chat`);
    return res.data;
};

export const getOrderByProduct = async (productId) => {
    const res = await instance.get(`/by-product/${productId}`);
    return res.data;
};

export const getOrderReviews = async (orderId) => {
    const res = await instance.get(`/${orderId}/reviews`);
    return res.data;
};