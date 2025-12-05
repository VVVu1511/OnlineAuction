import express from 'express';
import * as contactService from '../services/contact.service.js'
import authMiddleware from "../middleware/auth.js"; // adjust path

const router = express.Router();

router.put('/answer', authMiddleware, async (req, res) => {
    if(!req.user.id || req.user.role_description !== "seller"){
            res.status(500).json({ message: `Not a bidder` });
        }
    
    const { productId, questionId, answer } = req.body;

    try {
        const updatedQuestion = await contactService.answerQuestion(productId, questionId, answer);
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
    if(!req.user.id || req.user.role_description !== "bidder"){
        res.status(500).json({ message: `Not a bidder` });
    }

    try {
        const userId = req.user.id; // from authMiddleware
        const { product_id, question } = req.body;

        if (!product_id || !question) {
            return res.status(400).json({ success: false, message: "Missing product_id or question" });
        }

        const result = await contactService.askSeller({ userId, productId: product_id, question });
        await contactService.emailAsking(userId, product_id , question);

        res.json({ success: true, data: result.data });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.message || "Server error" });
    }
});




export default router;