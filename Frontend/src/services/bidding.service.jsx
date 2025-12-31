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

export const getMyBidding = () =>
    instance.get("/")
        .then(res => res.data);

export const rateBidder = (bidderId, productId, comment, rating) =>
    instance.post("/rateBidder", {
        bidder_id: bidderId,
        product_id: productId,
        comment,
        rating
    }).then(res => res.data);
