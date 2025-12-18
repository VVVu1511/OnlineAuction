import axios from "axios";

const instance = axios.create({
    baseURL: "http://localhost:3000/category",
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

export async function fetchParentCategories() {
    const res = await instance.get("/allParent");
    if(res.status === 201){
        return res.data;
    } else {
        throw new Error("Error fetching parent categories");
    }
}

export async function fetchChildCategory(id) {
    const res = await instance.get(`/child/${id}`);

    console.log("fetchChildCategory response:", res);

    if(res.status === 201){
        return res.data;
    } else {
        throw new Error("Error fetching child category");
    }
}

export async function getAllCategories() {
    const res = await instance.get("/all");
    if (res.status === 200) return res.data;
    throw new Error("Error fetching categories");
}

export async function addCategory(description) {
    const res = await instance.post("/", { description });
    if (res.status === 200) return res.data;
    throw new Error("Add category failed");
}

export async function updateCategory(id, description) {
    const res = await instance.put("/", { id, description });
    if (res.status === 200) return res.data;
    throw new Error("Update category failed");
}

export async function deleteCategory(id) {
    const res = await instance.delete("/", {
        data: { id }
    });
    if (res.status === 200) return res.data;
    throw new Error("Delete category failed");
}

export async function getCategoryById(id) {
    const res = await instance.get(`/${id}`);

    console.log("getCategoryById response:", res);

    if (res.status === 200 || res.status === 201) return res.data;
    throw new Error("Error fetching category by ID");
}