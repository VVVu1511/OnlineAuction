import express from 'express';
import * as contactService from '../services/contact.service.js';
import * as productService from '../services/product.service.js';
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

/**
 * =========================
 * SELLER ANSWER QUESTION
 * =========================
 */
router.put('/answer', async (req, res) => {
    try {
        const { productId, questionId, answer } = req.body;

        // 2️⃣ Check product
        const product = await productService.getProductInfor(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found",
                data: null
            });
        }

        // 4️⃣ Update answer
        const updatedQuestion = await contactService.answerQuestion(
            productId,
            questionId,
            answer
        );

        // 5️⃣ Send email notify
        await contactService.emailAnswering(productId, questionId, answer);

        return res.status(200).json({
            success: true,
            message: "Answer updated successfully",
            data: updatedQuestion
        });

    } catch (err) {
        console.error(err);
        return res.status(400).json({
            success: false,
            message: err.message,
            data: null
        });
    }
});

/**
 * =========================
 * BIDDER ASK SELLER
 * =========================
 */
router.post('/ask/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        const { product_id, question } = req.body;

        if (!product_id || !question) {
            return res.status(400).json({
                success: false,
                message: "Missing product_id or question",
                data: null
            });
        }

        // 2️⃣ Insert question
        const result = await contactService.askSeller({
            userId,
            productId: product_id,
            question
        });

        // 3️⃣ Email seller
        await contactService.emailAsking(userId, product_id, question);

        return res.status(201).json({
            success: true,
            message: "Question sent to seller successfully",
            data: result.data
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: err.message || "Server error",
            data: null
        });
    }
});

export default router;
