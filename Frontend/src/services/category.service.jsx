import axios from "axios";

const instance = axios.create({
    baseURL: "http://localhost:3000/category",
    timeout: 20000,
});

/* =========================
   CATEGORY SERVICES
========================= */

// Parent categories
export const fetchParentCategories = () =>
    instance.get("/allParent")
        .then(res => res.data);

// Child categories
export const fetchChildCategory = (id) =>
    instance.get(`/child/${id}`)
        .then(res => res.data);

// All categories
export const getAllCategories = () =>
    instance.get("/all")
        .then(res => res.data);

// Add category
export const addCategory = (description) =>
    instance.post("/", { description })
        .then(res => res.data);

// Update category
export const updateCategory = (id, description) =>
    instance.put("/", { id, description })
        .then(res => res.data);

// Delete category
export const deleteCategory = (id) =>
    instance.delete("/", {
        data: { id },
    }).then(res => res.data);

// Get category by ID
export const getCategoryById = (id) =>
    instance.get(`/${id}`)
        .then(res => res.data);
