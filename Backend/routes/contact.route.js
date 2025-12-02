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


export default router;