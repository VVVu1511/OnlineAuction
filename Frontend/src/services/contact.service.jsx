import axios from "axios";

const instance = axios.create({
    baseURL: "http://localhost:3000/contact",
    timeout: 20000,
});

/* =========================
   CONTACT / Q&A SERVICES
========================= */

// Bidder asks seller a question
export const askSeller = (productId, question) =>
    instance.post("/ask", {
        product_id: productId,
        question,
    }).then(res => res.data);

// Seller answers a question
export const answerQuestion = (questionId, answer, productId) =>
    instance.put("/answer", {
        questionId,
        answer,
        productId,
    }).then(res => res.data);
