import express from 'express'
import * as productService from '../services/product.service.js'
import authMiddleware from "../middleware/auth.js"; // adjust path


const router = express.Router();

router.post('/checkCanBid', authMiddleware, async (req, res) => {
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

router.post('/bid', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const { product_id, price } = req.body;

        const product = await productService.getProductById(product_id);
        if (!product) return res.status(404).json({ message: 'Product not found' });

        // Kiểm tra giá hợp lệ
        const minPrice = product.current_price + product.bid_step;
        if (price < minPrice) return res.status(400).json({ message: `Bid must be at least ${minPrice}` });

        await productService.new_bid({
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

        const data = await productService.getBidHistory(product_id);
        
        res.status(201).json({data:data ,message: 'Get bid history successfully!'});
    }
    catch(error){
        res.status(404).json({error: error.message, message: 'Error getting bid history'});
    }
})

router.delete('/watchlist', authMiddleware, async function (req,res) {
    try {
        const userID = req.user.id;
         // decoded token set by middleware
        const productId = req.body.productId;

        if (!productId) return res.status(400).json({ message: "Missing product ID" });

        // Add to watchlist
        await productService.delWatchList(userID, productId);

        res.status(201).json({ 
            success: true,
            message: 'Product added to watchlist successfully!',
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            success: false,
            message: 'Error deleting product of watchlist', 
            error: error.message,
        });
    }
})

router.post('/watchlist', authMiddleware, async function (req, res) {
    try {
        const userID = req.user.id;
         // decoded token set by middleware
        const productId = req.body.productId;

        if (!productId) return res.status(400).json({ message: "Missing product ID" });

        // Add to watchlist
        await productService.addWatchList(userID, productId);

        res.status(201).json({ 
            success: true,
            message: 'Product added to watchlist successfully!',
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            success: false,
            message: 'Error adding product to watchlist', 
            error: error.message,
        });
    }
});

router.get('/watchlist', authMiddleware, async function (req,res)  {
    try{
        const id = req.user.id;

        const data = await productService.getWatchList(id);
        
        res.status(201).json({data: data , message: 'Get watch list successfully!'});
    }
    catch(error){
        res.status(404).json({error: error.message, message: 'Error getting watch list'});
    }
})

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
            id: 0,
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

export default router;