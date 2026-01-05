import axios from "axios";

const instance = axios.create({
    baseURL: "http://localhost:3000/contact",
    timeout: 20000,
});

/* =========================
CONTACT / Q&A SERVICES
========================= */

// Bidder asks seller a question
export const askSeller = (productId, question, id) =>
    instance.post(`/ask/${id}`, {
        product_id: productId,
        question,
    }).then(res => res.data);

// Seller answers a question
export const answerQuestion = ({ productId, questionId, answer }) =>
    instance.put("/answer", {
        productId,
        questionId,
        answer,
    }).then(res => res.data);

export const sendEndBidEmail = async ({
    bestBidderId,
    sellerId,
    productId
}) => {
    const res = await instance.post('/end-bid', {
        bestBidderId,
        sellerId,
        productId
    });

    return res.data;
};


