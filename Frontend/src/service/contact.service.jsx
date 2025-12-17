import axios from "axios";

const instance = axios.create({
    baseURL: "http://localhost:3000/contact",
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

export async function askSeller(productId, question) {
    const res = await instance.post("/ask", {
        product_id: productId,
        question,
    });

    if (res.status === 201) {
        return res.data;
    } else {
        throw new Error("Error asking seller");
    }
}

export async function answerQuestion(questionId, answer, productId) {
    const res = await instance.put("/answer", {
        questionId,
        answer,
        productId,
    });

    if (res.status === 200) {
        return res.data;
    } else {
        throw new Error("Error answering question");
    }
}