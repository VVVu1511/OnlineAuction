import express from 'express';
import * as orderService from '../services/order.service.js';

const router = express.Router();


// GET /api/orders/by-product/:productId
router.get("/by-product/:productId", async (req, res) => {
    try {
        const { productId } = req.params;

        const order = await orderService.getOrderByProduct(productId);

        res.json(order);
    } catch (err) {
        res.status(404).json({
            message: err.message || "Order not found"
        });
    }
});

/**
 * Get chat history of an order
 */
router.get('/:productId/chat', async (req, res) => {
    try {
        const data = await orderService.getChatHistory(
            +req.params.productId
        );
        res.json({ success: true, data });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: err.message,
        });
    }
});


/**
 * Create order when auction ends (winner exists)
 */
router.post('/create', async (req, res) => {
    try {
        const data = await orderService.createOrder(req.body);
        res.json({ success: true, data });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: err.message,
            data: null
        });
    }
});

/**
 * Buyer submit payment + address
 */
router.post('/:productId/payment', async (req, res) => {
    try {
        const { userId, payment_info, address } = req.body;

        const data = await orderService.submitPayment(
            +req.params.productId,
            +userId,
            { payment_info, address }
        );

        res.json({ success: true, data });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});

/**
 * Seller confirm payment + shipping info
 */
router.post('/:productId/shipping', async (req, res) => {
    try {
        const { userId, shipping_info } = req.body;

        const data = await orderService.confirmShipping(
            +req.params.productId,
            +userId,
            shipping_info
        );

        res.json({ success: true, data });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});

/**
 * Buyer confirm received
 */
router.post('/:productId/confirm-receive', async (req, res) => {
    try {
        const { userId } = req.body;

        const data = await orderService.confirmReceive(
            +req.params.productId,
            +userId
        );

        res.json({ success: true, data });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});

/**
 * Review (+/-)
 */
router.post('/:productId/review', async (req, res) => {
    try {
        const { userId, score, comment } = req.body;

        const data = await orderService.upsertReview(
            +req.params.productId,
            +userId,
            { score, comment }
        );

        res.json({ success: true, data });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});

/**
 * Cancel order (seller only)
 */
router.post('/:productId/cancel', async (req, res) => {
    try {
        const { userId } = req.body;

        const data = await orderService.cancelOrder(
            +req.params.productId,
            +userId
        );

        res.json({ success: true, data });
    } catch (err) {
        res.status(403).json({ success: false, message: err.message });
    }
});

/**
 * Chat
 */
router.post('/:productId/chat', async (req, res) => {
    try {
        const { userId, message } = req.body;

        const data = await orderService.sendMessage(
            +req.params.productId,
            +userId,
            message
        );

        res.json({ success: true, data });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});

/**
 * GET /order/:orderId/reviews
 */
router.get("/:orderId/reviews", async (req, res) => {
    try {
        const orderId = Number(req.params.orderId);

        const reviews = await orderService.getReviewsByOrder(orderId);

        return res.json({
            success: true,
            data: reviews,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Không lấy được đánh giá",
        });
    }
});

export default router;
