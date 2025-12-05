import express from 'express'
import * as productService from '../services/product.service.js'
import authMiddleware from "../middleware/auth.js"; // adjust path

const router = express.Router();

router.get('/myActiveProducts',authMiddleware, async (req, res) => {
    const userId = req.user.id;

    try {
        const products = await productService.getActiveProducts(userId);
        res.json({ success: true, data: products });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});

router.get('/myWonProducts',authMiddleware, async (req, res) => {
    const userId = req.user.id;

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

router.post('/add', async(req,res) => {
    try{
        const data = {
            name: req.body.name,
            image_path: JSON.stringify(req.body.image_path),
            current_price: req.body.current_price,
            best_bidder: req.body.best_bidder,
            sell_price: req.body.sell_price,
            upload_date: req.body.upload_date,
            time_left: req.body.time_left,
            bid_counts: req.body.bid_counts,        
            seller: req.body.seller ,
            description: req.body.description    
        };
        
        await productService.addProduct(data);

        res.status(201).json({message: 'Add product succesfully!'});
    }
    catch(error){
        res.status(404).json({error: error.message, message: 'Error adding product'});
    }
})

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

        res.status(201).json({data: productInfor, message: 'Delete product successfully!'}); 
    }

    catch(error){
        res.status(404).json({ error: error.message, message: 'Error deleting product'});
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

router.put('/endAuction/:id', authMiddleware, async (req, res) => {
    // Check admin
    if (req.user.role_description !== "admin") {
        return res.status(403).json({
            success: false,
            message: 'Not admin'
        });
    }

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