import express from 'express'
import * as productService from '../services/product.service.js'
import authMiddleware from "../middleware/auth.js"; // adjust path
import {upload} from '../config/multer.js';
import path from "path";
import fs from "fs";

const router = express.Router();

router.get('/all', async(req,res) => {
    try {
        const products = await productService.getAllProducts();
        res.json({ success: true, data: products });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
})

router.get('/myActiveProducts/:id', async (req, res) => {
    const userId = parseInt(req.params.id);

    try {
        const products = await productService.getActiveProducts(userId);
        res.json({ success: true, data: products });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});

router.get('/myWonProducts/:id', async (req, res) => {
    const userId = parseInt(req.params.id);

    try {
        const products = await productService.getWonProducts(userId);
        res.json({ success: true, data: products });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});

router.get('/search', async function (req, res) {
    try{
        const q = req.query.q || '';
        const kw = q.replace(/ /g, ' & ');
        const data = await productService.search(kw);
        
        res.status(201).json({data: data , message: 'Search product information succesfully!'});
    }
    catch(error){
        res.status(404).json({error: error.message, message: 'Error searching product'});
    }
});

router.get('/infor/:id', async(req,res) => {
    try{
        const id = parseInt(req.params.id);

        const data = await productService.getProductInfor(id);
        
        res.status(201).json({data: data , message: 'Get product information succesfully!'});
    }
    catch(error){
        res.status(404).json({error: error.message, message: 'Error getting prod infor'});
    }
})

router.get('/Q_A/:id', async(req,res) => {
    try{
        const id = parseInt(req.params.id);

        const data = await productService.getQ_A(id);
        
        res.status(201).json({data: data , message: 'Get Q & A succesfully!'});
    }
    catch(error){
        res.status(404).json({error: error.message, message: 'Error getting Q & A'});
    }
})

router.get('/top5BidCounts', async(req,res) => {
    try{
        const data = await productService.getTop5BidCounts();
        
        res.status(201).json({data: data,message: 'Get 5 bid counts product succesfully!'});
    }
    catch(error){
        res.status(404).json({error: error.message, message: 'Error adding product'});
    }
})

router.get('/top5NearEnd', async(req,res) => {
    try{
        const data = await productService.getTop5NearEnd();
        
        res.status(201).json({data: data,message: 'Add 5 near end product succesfully!'});
    }
    catch(error){
        res.status(404).json({error: error.message, message: 'Error adding product'});
    }
})

router.get('/top5Price', async(req,res) => {
    try{
        const data = await productService.getTop5Price();
        
        res.status(201).json({data: data,message: 'Get 5 price product succesfully!'});
    }
    catch(error){
        res.status(404).json({error: error.message, message: 'Error adding product'});
    }
})

router.post("/add/:id", (req, res) => {
    upload.array("images", 4)(req, res, async (err) => {

        console.log("---- MULTER DEBUG ----");
        console.log("Headers:", req.headers["content-type"]);
        console.log("Body:", req.body);
        console.log("Files:", req.files);
        console.log("----------------------");

        if (err) {
            console.error("Multer error:", err);
            return res.status(400).json({
                success: false,
                message: err.message
            });
        }

        try {
            const autoExtend = req.body.autoExtend === "true";
            const sellerId = parseInt(req.params.id);

            const [product] = await productService.addProduct({
                name: req.body.name,
                current_price: req.body.startPrice,
                sell_price: req.body.buyNowPrice || null,
                bid_step: req.body.bidStep,
                extend_after: autoExtend ? 5 : 0,
                extend_minutes: autoExtend ? 10 : 0,
                description: req.body.description,
                seller: sellerId,
                upload_date: new Date(),
                bid_counts: 0,
                state_id: 1
            });

            const productId = product.id;

            const productDir = path.join("static/images", String(productId));
            fs.mkdirSync(productDir, { recursive: true });

            const imagePaths = [];
                req.files?.forEach((file, index) => {
                    const newName = `${index + 1}.webp`;
                    const newPath = path.join(productDir, newName);
                    fs.renameSync(file.path, newPath);
                    imagePaths.push(newName);
            });

            await productService.updateImagePath(productId, JSON.stringify(imagePaths));

            res.status(201).json({ success: true });

        } catch (e) {
            console.error(e);
            res.status(500).json({ success: false });
        }
    });
});

router.get('/getByCat/:cat_id',async(req,res) => {
    try{
        const cat_id = parseInt(req.params.cat_id);

        const data = await productService.getByCategory(cat_id);

        res.status(201).json({data: data ,message: 'Get product by category succesfully!'});
    }
    catch(error){
        res.status(404).json({error: error.message, message: 'Error getting products by category'});
    }
})

router.get('/:id',async(req,res) => {
    try{
        const id = parseInt(req.params.id);

        const productInfor = await productService.getProductInfor(id);

        res.status(201).json({data: productInfor, message: 'Get product successfully!'}); 
    }

    catch(error){
        res.status(404).json({ error: error.message, message: 'Error getting product'});
    }
});

router.delete('/:id', async(req,res) => {
    try{
        const id = parseInt(req.params.id);

        await productService.deleteProduct(id);

        res.status(201).json({success: true, data: productInfor, message: 'Delete product successfully!'}); 
    }

    catch(error){
        res.status(404).json({ success: false, error: error.message, message: 'Error deleting product'});
    }
})

router.get('/bestBidder/:id', async(req,res) => {
    try{
        const id = parseInt(req.params.id);

        const data = await productService.getBestBidder(id);

        res.status(201).json({data: data, message: 'Get best bidder successfully!'}); 
    }

    catch(error){
        res.status(404).json({ error: error.message, message: 'Error getting best bidder'});
    }
})

router.get('/sellerInfor/:id', async (req,res) => {
    try{
        const id = parseInt(req.params.id);

        const data = await productService.getSellerInfor(id);

        res.status(201).json({data: data, message: 'Get seller information successfully!'}); 
    }

    catch(error){
        res.status(404).json({ error: error.message, message: 'Error getting seller information'});
    }
})

router.get('/related/:id', async (req,res) => {
    try{
        const id = parseInt(req.params.id);

        const data = await productService.get5relatedProducts(id);

        res.status(201).json({data: data, message: 'Get 5 related products successfully!'}); 
    }

    catch(error){
        res.status(404).json({ error: error.message, message: 'Error getting 5 related products'});
    }
})

router.put('/appendDescription/:id', async (req, res) => {
    const productId = parseInt(req.params.id);
    const { newDescription } = req.body;

    try {
        const updatedProduct = await productService.appendDescription(productId, newDescription);
        
        res.status(200).json({
            success: true,
            message: 'Description updated successfully!',
            data: updatedProduct
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: err.message
        });
    }
});

router.put('/endAuction/:id', async (req, res) => {
    try {
        const productId = parseInt(req.params.id);

        const result = await productService.productEndBid(productId);

        return res.json({
            success: true,
            message: "Auction ended successfully",
            data: result
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: "Error ending auction",
            error: err.message
        });
    }
});


export default router;