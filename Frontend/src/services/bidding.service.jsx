import axios from "axios";

const instance = axios.create({
    baseURL: "http://localhost:3000/bidding",
    timeout: 20000,
});

export const getBidHistory = (productId) =>
    instance.get(`/bid_history/${productId}`)
        .then(res => res.data);

export const getDeniedBidders = (productId) =>
    instance.get(`/denyBidder/${productId}`)
        .then(res => res.data);

export const denyBidder = (productId, bidderId) =>
    instance.post(`/denyBidder/${productId}`, { bidderId })
    .then(res => res.data);

export const getMyBidding = (id) =>
    instance.get(`/${id}`)
        .then(res => res.data);

export const rateBidder = (bidderId, productId, comment, rating) =>
    instance.post("/rateBidder", {
        bidder_id: bidderId,
        product_id: productId,
        comment,
        rating
    }).then(res => res.data);

export const checkCanBid = (productId, userId) =>
    instance.post(`/checkCanBid/${userId}`, {
        product_id: productId,
    }).then(res => res.data);

export const placeBid = (productId, price, userId) =>
    instance.post(`/bid/${userId}`, {
        product_id: productId,
        price,
    }).then(res => res.data);