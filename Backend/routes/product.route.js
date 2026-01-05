import express from 'express';
import * as productService from '../services/product.service.js';
import authMiddleware from "../middleware/auth.js";
import { upload } from '../config/multer.js';
import path from "path";
import fs from "fs";

// id
// name
// image_path
// current_price
// best_bidder
// sell_price
// upload_date
// bid_counts
// seller
// description
// fts
// bid_step
// state_id
// winner
// starting_price
// extend
// end_date

const router = express.Router();

/* ===================== GET ===================== */

router.get('/all', async (req, res) => {
    try {
        const data = await productService.getAllProducts();
        res.json({ success: true, message: 'Get all products successfully', data });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message, data: null });
    }
});

router.get('/myActiveProducts/:id', async (req, res) => {
    try {
        const data = await productService.getActiveProducts(+req.params.id);
        res.json({ success: true, message: 'Get active products successfully', data });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message, data: null });
    }
});

router.get('/myWonProducts/:id', async (req, res) => {
    try {
        const data = await productService.getWonProducts(+req.params.id);
        res.json({ success: true, message: 'Get won products successfully', data });
        
    } catch (err) {
        res.status(500).json({ success: false, message: err.message, data: null });
    }
});

router.get('/search', async (req, res) => {
    try {
        const {
            q = '',
            page = 1,
            pageSize = 10,
            sort = 'time_desc'
        } = req.query;

        const keyword = q.replace(/ /g, ' & ');

        const data = await productService.search(
            keyword,
            Number(page),
            Number(pageSize),
            sort
        );

        res.json({
            success: true,
            message: 'Search product successfully',
            data: data.items,
            pagination: data.pagination
        });

    } catch (err) {
        console.error(err);
        res.status(400).json({
            success: false,
            message: err.message,
            data: null
        });
    }
});

router.get('/infor/:id', async (req, res) => {
    try {
        const data = await productService.getProductInfor(+req.params.id);
        res.json({ success: true, message: 'Get product information successfully', data });
    } catch (err) {
        res.status(404).json({ success: false, message: err.message, data: null });
    }
});

router.get('/Q_A/:id', async (req, res) => {
    try {
        const data = await productService.getQ_A(+req.params.id);
        res.json({ success: true, message: 'Get Q&A successfully', data });
    } catch (err) {
        res.status(404).json({ success: false, message: err.message, data: null });
    }
});

router.get('/top5BidCounts', async (req, res) => {
    try {
        const data = await productService.getTop5BidCounts();
        res.json({ success: true, message: 'Get top 5 bid count products', data });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message, data: null });
    }
});

router.get('/top5NearEnd', async (req, res) => {
    try {
        const data = await productService.getTop5NearEnd();
        res.json({ success: true, message: 'Get top 5 near-end products', data });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message, data: null });
    }
});

router.get('/top5Price', async (req, res) => {
    try {
        const data = await productService.getTop5Price();
        res.json({ success: true, message: 'Get top 5 price products', data });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message, data: null });
    }
});

router.get('/getByCat/:cat_id', async (req, res) => {
    try {
        const data = await productService.getByCategory(+req.params.cat_id);
        res.json({ success: true, message: 'Get products by category successfully', data });
    } catch (err) {
        res.status(404).json({ success: false, message: err.message, data: null });
    }
});

router.get('/bestBidder/:id', async (req, res) => {
    try {
        const data = await productService.getBestBidder(+req.params.id);
        res.json({ success: true, message: 'Get best bidder successfully', data });
    } catch (err) {
        res.status(404).json({ success: false, message: err.message, data: null });
    }
});

router.get('/sellerInfor/:id', async (req, res) => {
    try {
        const data = await productService.getSellerInfor(+req.params.id);
        res.json({ success: true, message: 'Get seller information successfully', data });
    } catch (err) {
        res.status(404).json({ success: false, message: err.message, data: null });
    }
});

router.get('/related/:id', async (req, res) => {
    try {
        const data = await productService.get5relatedProducts(+req.params.id);
        res.json({ success: true, message: 'Get related products successfully', data });
    } catch (err) {
        res.status(404).json({ success: false, message: err.message, data: null });
    }
});

/* ===================== POST ===================== */

router.post('/add/:id', (req, res) => {
    upload.array("images", 4)(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ success: false, message: err.message, data: null });
        }

        try {
            const sellerId = +req.params.id;
            const autoExtend = req.body.autoExtend === "true";

            const { id: productId } = await productService.addProduct({
                name: req.body.name,
                current_price: req.body.startPrice,
                sell_price: req.body.buyNowPrice || null,
                bid_step: req.body.bidStep,
                extend: autoExtend ? true : false,
                description: req.body.description,
                seller: sellerId,
                upload_date: new Date(),
                bid_counts: 0,
                state_id: 1,
                end_date:  new Date(req.body.endDate)
            });

            const productDir = path.join("static/images", String(productId));
            fs.mkdirSync(productDir, { recursive: true });

            const imagePaths = [];
            req.files?.forEach((file, index) => {
                const newName = `${index + 1}.webp`;
                fs.renameSync(file.path, path.join(productDir, newName));
                imagePaths.push(newName);
            });

            await productService.updateImagePath(productId, JSON.stringify(imagePaths));

            res.status(201).json({
                success: true,
                message: 'Add product successfully',
                data: { productId, images: imagePaths }
            });
        } catch (e) {
            res.status(500).json({ success: false, message: e.message, data: null });
        }
    });
});

/* ===================== PUT ===================== */

router.put('/appendDescription/:id', async (req, res) => {
    try {
        const data = await productService.appendDescription(+req.params.id, req.body.newDescription);
        res.json({ success: true, message: 'Description updated successfully', data });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message, data: null });
    }
});

router.put('/endAuction/:id', async (req, res) => {
    try {
        const data = await productService.productEndBid(+req.params.id);
        res.json({ success: true, message: 'Auction ended successfully', data });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message, data: null });
    }
});

/* ===================== DELETE ===================== */

router.delete('/:id', async (req, res) => {
    try {
        const data = await productService.deleteProduct(+req.params.id);
        res.json({ success: true, message: 'Delete product successfully', data });
    } catch (err) {
        res.status(404).json({ success: false, message: err.message, data: null });
    }
});


export default router;
