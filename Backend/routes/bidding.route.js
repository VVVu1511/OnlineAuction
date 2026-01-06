import express from 'express';
import * as biddingService from '../services/bidding.service.js';
import * as productService from '../services/product.service.js';
import * as accountService from '../services/account.service.js';
import * as contactService from '../services/contact.service.js';

const router = express.Router();


/**
 * GET /api/denied-bidders/check?productId=1&userId=2
 */
router.get('/check', async (req, res) => {
    try {
        const { productId, userId } = req.query;

        if (!productId || !userId) {
            return res.status(400).json({
                success: false,
                message: 'productId and userId are required'
            });
        }

        const denied = await biddingService.isUserDeniedBid(productId, userId);

        return res.status(200).json({
            success: true,
            denied
        });

    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
});

/**
 * Refuse bidder (seller)
 */
router.put('/refuse', async (req, res) => {
    try {
        const { productId, bidderId } = req.body;

        const data = await biddingService.refuseBidder(productId, bidderId);

        return res.status(200).json({
            success: true,
            message: 'Bidder refused successfully',
            data
        });
    } catch (err) {
        return res.status(400).json({
            success: false,
            message: err.message,
            data: null
        });
    }
});

/**
 * Check if bidder can bid
 */
router.post('/checkCanBid/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        const { product_id } = req.body;

        const product = await productService.getProductInfor(product_id);
        
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found',
                data: null
            });
        }

        const reviews = await productService.getReviews(userId);

        let canBid = false;
        let reason = '';

        if (reviews.length > 0) {
            const positive = reviews.filter(r => r.rating > 0).length;
            canBid = positive / reviews.length >= 0.8;
            if (!canBid) {
                reason = 'Your positive rating is too low';
            }
        } else {
            reason = 'You are not allowed to bid without ratings';
        }

        return res.json({
            success: true,
            message: 'Check bid permission successfully',
            data: {
                canBid,
                reason,
                suggestedPrice: product.current_price + product.bid_step
            }
        });

    } catch (err) {
        return res.status(500).json({
            success: false,
            message: 'Error checking bid eligibility',
            data: null
        });
    }
});

/**
 * Place a bid
 */
router.post('/bid/:id',  async (req, res) => {
    try {
        const { product_id, price } = req.body;
        const product = await productService.getProductInfor(product_id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found',
                data: null
            });
        }

        const minPrice = product.current_price + product.bid_step;
        if (price < minPrice) {
            return res.status(400).json({
                success: false,
                message: `Bid must be at least ${minPrice}`,
                data: null
            });
        }

        if (price === product.sell_price) {
            await productService.productEndBid(product_id);
        }

        const data = await biddingService.new_bid({
            user_id: req.params.id,
            product_id,
            price
        });

        await contactService.emailAfterBid(product_id, product.seller, req.params.id, price);

        return res.status(201).json({
            success: true,
            message: 'Bid placed successfully',
            data
        });

    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err,
            data: null
        });
    }
});

/**
 * Get bid history
 */
router.get('/bid_history/:product_id',  async (req, res) => {
    try {
        const data = await biddingService.getBidHistory(req.params.product_id);

        return res.status(200).json({
            success: true,
            message: 'Get bid history successfully',
            data
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: 'Error getting bid history',
            data: null
        });
    }
});

/**
 * Deny bidder (seller)
 */
router.post('/denyBidder/:product_id', async (req, res) => {
    try {
        const productId = req.params.product_id;
        const { bidderId } = req.body;

        const product = await productService.getProductInfor(productId);

        const data = await biddingService.denyBidder(productId, bidderId);

        const bidder = await accountService.findAllById(bidderId);
        await contactService.emailDeniedBidder(product, bidder);

        return res.json({
            success: true,
            message: 'Bidder denied successfully',
            data
        });

    } catch (err) {
        return res.status(500).json({
            success: false,
            message: 'Server error',
            data: null
        });
    }
});

/**
 * Get denied bidders
 */
router.get('/denyBidder/:product_id', async (req, res) => {
    try {
        const data = await biddingService.getDeniedBidders(req.params.product_id);

        return res.json({
            success: true,
            message: 'Get denied bidders successfully',
            data
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: 'Error getting denied bidders',
            data: null
        });
    }
});

/**
 * Rate bidder
 */
router.post('/rateBidder', async (req, res) => {
    try {
        const { bidder_id, product_id, comment, rating } = req.body;

        const data = await biddingService.rateBidder(
            bidder_id,
            product_id,
            comment,
            rating
        );

        return res.status(201).json({
            success: true,
            message: 'Bidder rated successfully',
            data
        });

    } catch (err) {
        return res.status(500).json({
            success: false,
            message: 'Error rating bidder',
            data: null
        });
    }
});

/**
 * Rate seller
 */
router.post('/rateSeller', async (req, res) => {
    try {
        const { seller_id, product_id, comment, rating } = req.body;

        const data = await biddingService.rateSeller(
            seller_id,
            product_id,
            comment,
            rating
        );

        return res.status(201).json({
            success: true,
            message: 'Seller rated successfully',
            data
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: err.message || 'Error rating seller',
            data: null
        });
    }
});


/**
 * GET bidding list of current user
 */
router.get('/:id', async (req, res) => {
    try {
        const data = await biddingService.getBiddingList(req.params.id);

        return res.status(200).json({
            success: true,
            message: 'Get bidding list successfully',
            data
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error getting bidding list',
            data: null
        });
    }
});

export default router;
