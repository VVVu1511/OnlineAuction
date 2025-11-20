import express from 'express'
import * as productService from '../services/product.service.js'

const router = express.Router();

router.get('/:id',async(req,res) => {
    try{
        const id = parseInt(req.params.id);

        const productInfor = productService.getProductInfor(id);

        res.status(201).json({data: productInfor, message: 'Get product successfully!'}); 
    }

    catch(error){
        res.status(404).json({ error: error.message, message: 'Error getting product'});
    }
});

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

export default router;