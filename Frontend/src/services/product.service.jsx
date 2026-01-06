import axios from "axios";

const instance = axios.create({
    baseURL: "http://localhost:3000/product",
    timeout: 20000,
});

/* =========================
PRODUCT SERVICES
========================= */

export const getProductsByCategory = (
    categoryId,
    page = 1,
    pageSize = 5,
    sort = "endTimeDesc"
) =>
    instance.get(`/getByCat/${categoryId}`, {
        params: { page, pageSize, sort }
    }).then(res => res.data);

    
// services/product.service.jsx
export async function searchProducts(
    keyword,
    { page = 1, pageSize = 5, sort = "time_desc" } = {}
) {
    const res = await instance.get("/search", {
        params: {
            q: keyword,
            page,
            pageSize,
            sort
        }
    });

    return res.data;
}

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

export async function advancedSearch(params) {
    const res = await instance.get("/advanced-search", { params });
    return res.data;
}

export async function updateProductInfo(id, payload) {
    return instance.put(`/${id}/update`, payload)
        .then(res => res.data);
}