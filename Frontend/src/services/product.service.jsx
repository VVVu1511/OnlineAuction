import axios from "axios";

const instance = axios.create({
    baseURL: "http://localhost:3000/product",
    timeout: 20000,
});

/* =========================
PRODUCT SERVICES
========================= */

export const getProductsByCategory = (categoryId) =>
    instance.get(`/getByCat/${categoryId}`)
        .then(res => res.data);

export const searchProducts = (keyword) =>
    instance.get("/search", {
        params: { q: keyword },
    }).then(res => res.data);

export const appendProductDescription = (productId, newDescription) =>
    instance.put(`/appendDescription/${productId}`, {
        newDescription,
    }).then(res => res.data);

export const getSellerInfo = (productId) =>
    instance.get(`/sellerInfor/${productId}`)
        .then(res => res.data);

export const getBestBidder = (productId) =>
    instance.get(`/bestBidder/${productId}`)
        .then(res => res.data);

export const getRelatedProducts = (productId) =>
    instance.get(`/related/${productId}`)
        .then(res => res.data);

export const getQaHistory = (productId) =>
    instance.get(`/Q_A/${productId}`)
        .then(res => res.data);

export const checkCanBid = (productId) =>
    instance.post("/checkCanBid", {
        product_id: productId,
    }).then(res => res.data);

export const placeBid = (productId, price) =>
    instance.post("/bid", {
        product_id: productId,
        price,
    }).then(res => res.data);

export const addProduct = (formData, id) =>
    instance.post(`/add/${id}`, formData)
        .then(res => res.data);

export const getMyActiveProducts = (id) =>
    instance.get(`/myActiveProducts/${id}`)
        .then(res => res.data);

export const getMyWonProducts = (id) =>
    instance.get(`/myWonProducts/${id}`)
        .then(res => res.data);

export const getTop5NearEnd = () =>
    instance.get("/top5NearEnd")
        .then(res => res.data);

export const getTop5BidCounts = () =>
    instance.get("/top5BidCounts")
        .then(res => res.data);

export const getTop5Price = () =>
    instance.get("/top5Price")
        .then(res => res.data);

export const getAllProducts = () =>
    instance.get("/all")
        .then(res => res.data);

export const removeProduct = (id) =>
    instance.delete(`/${id}`, {
        data: { id },
    }).then(res => res.data);

export const getProductInfo = (productId) =>
    instance.get(`/infor/${productId}`)
        .then(res => res.data);
