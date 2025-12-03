// routes/product.js
import express from 'express';
import * as biddingService from '../services/bidding.service.js'
import * as productService from '../services/product.service.js'
import authMiddleware from "../middleware/auth.js"; // adjust path

const router = express.Router();

router.get('',authMiddleware, async function (req,res)  {
    try{
        const id = req.user.id;

        const data = await biddingService.getBiddingList(id);
        
        res.status(201).json({data: data , message: 'Get bidding list successfully!'});
    }
    catch(error){
        res.status(404).json({error: error.message, message: 'Error getting bidding list'});
    }
})

// Từ chối lượt ra giá của bidder
router.put('/refuse', async (req, res) => {
    const { productId, bidderId } = req.body;

    try {
        const updatedProduct = await biddingService.refuseBidder(productId, bidderId);
        res.status(200).json({
            success: true,
            message: 'Bidder has been refused successfully!',
            data: updatedProduct
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: err.message
        });
    }
});

router.post('/checkCanBid',authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const { product_id } = req.body;

        const product = await productService.getProductById(product_id);
        if (!product) return res.status(404).json({ message: 'Product not found' });

        // Lấy 10 đánh giá gần nhất, full, đếm +, chia SL
        const recentReviews = await productService.getReviews(userId);
        let canBid = false;
        let reason = '';

        if (recentReviews.length === 0) {
            //haven't been rated
            // canBid = product.allow_unrated_bids;
            if (!canBid) reason = 'You are not allowed to bid without ratings.';
        } else {
            const positiveCount = recentReviews.filter(r => r.rating > 0).length;
            const rate = positiveCount / recentReviews.length;
            canBid = rate >= 0.8;
            if (!canBid) reason = `Your positive rating is too low (${Math.round(rate*100)}%).`;
        }

        const minPrice = product.current_price + product.bid_step;

        res.json({
            canBid,
            reason,
            suggestedPrice: minPrice
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error checking bid eligibility' });
    }
});

router.post('/bid',authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const { product_id, price } = req.body;

        const product = await productService.getProductById(product_id);
        if (!product) return res.status(404).json({ message: 'Product not found' });

        // Kiểm tra giá hợp lệ
        const minPrice = product.current_price + product.bid_step;
        if (price < minPrice) return res.status(400).json({ message: `Bid must be at least ${minPrice}` });

        await biddingService.new_bid({
            user_id: userId,
            product_id,
            time: new Date(),
            price
        });

        res.status(201).json({ message: 'Bid placed successfully', final_price: price });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error placing bid' });
    }
});

router.get('/bid_history/:product_id', async function (req,res) {
    try{
        const product_id = parseInt(req.params.product_id);

        const data = await biddingService.getBidHistory(product_id);
        
        res.status(201).json({data:data ,message: 'Get bid history successfully!'});
    }
    catch(error){
        res.status(404).json({error: error.message, message: 'Error getting bid history'});
    }
})

router.post('/denyBidder/:product_id', authMiddleware, async (req, res) => {
    const productId = req.params.product_id;
    const { bidderId } = req.body;

    if (!bidderId) return res.status(400).json({ success: false, message: "Missing bidderId" });

    try {
        const result = await biddingService.denyBidder(productId, bidderId);
        res.json({ success: true, data: result });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

router.get('/denyBidder/:product_id', authMiddleware, async (req, res) => {
    const productId = req.params.product_id;

    try {
        const deniedBidders = await getDeniedBidders(productId);
        res.json({ success: true, data: deniedBidders });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Lỗi khi lấy danh sách bị từ chối' });
    }
});

export default router;
