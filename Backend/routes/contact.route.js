import express from 'express';
import * as contactService from '../services/contact.service.js'
import authMiddleware from "../middleware/auth.js"; // adjust path

const router = express.Router();

router.put('/answer', authMiddleware, async (req, res) => {
    const { productId, questionId, answer } = req.body;

    try {
        const updatedQuestion = await answerQuestion(productId, questionId, answer);
        res.status(200).json({
            success: true,
            message: 'Answer updated successfully!',
            data: updatedQuestion
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: err.message
        });
    }
});

router.post('/ask', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id; // from authMiddleware
        const { product_id, question } = req.body;

        if (!product_id || !question) {
            return res.status(400).json({ success: false, message: "Missing product_id or question" });
        }

        const result = await contactService.askSeller({ userId, productId: product_id, question });

        res.json({ success: true, data: result.data });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.message || "Server error" });
    }
});


export default router;