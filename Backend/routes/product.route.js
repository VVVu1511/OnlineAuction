import express from 'express'
import * as productService from '../services/product.service.js'

const router = express.Router();


router.post('/bid_history', async function (req,res) {
    try{
        await productService.new_bid(req.body);
        
        res.status(201).json({message: 'Add new bid history successfully!'});
    }
    catch(error){
        res.status(404).json({error: error.message, message: 'Error adding new bid'});
    }
})

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

router.delete('/watchlist/:id', async function (req,res) {
    try{
        const id = parseInt(req.params.id);

        await productService.delWatchList(id, req.body.product_id);
        
        res.status(201).json({message: 'Delete product of watch list successfully!'});
    }
    catch(error){
        res.status(404).json({error: error.message, message: 'Error deleting product of watch list'});
    }
})

router.post('/watchlist/:id', async function (req,res) {
    try{
        const id = parseInt(req.params.id);

        await productService.addWatchList(id, req.body.product_id);
        
        res.status(201).json({message: 'Add new product to watch list successfully!'});
    }
    catch(error){
        res.status(404).json({error: error.message, message: 'Error adding new product to watch list'});
    }
})

router.get('/watchlist/:id', async function (req,res)  {
    try{
        const id = parseInt(req.params.id);

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


export default router;