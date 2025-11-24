import express from 'express'
import * as categoryService from '../services/category.service.js'

const router = express.Router();

router.post('',async(req,res) => {
    try{
        await categoryService.addNewCategory(req.body.description);
    
        res.status(201).json({message: 'Add category successfully'});
    }
    catch(err){
        console.error(err);

        res.status(500).json({ message: "Error adding category", error: err.message});
    }
});

router.put('', async(req,res) => {
    try{
        await categoryService.updateCategory(req.body);
    
        res.status(201).json({message: 'Update category successfully'});
    }
    catch(err){
        console.error(err);

        res.status(500).json({ message: "Error updating category", error: err.message});
    }
});

router.delete('', async(req,res) => {
    try{
        
        await categoryService.deleteCategory(req.body.id);
    
        res.status(201).json({message: 'Delete category successfully'});
    }
    catch(err){
        console.error(err);

        res.status(500).json({ message: "Error deleting category", error: err.message});
    }
});

router.get('/getAll', async(req,res) => {
    try{
        const data = await categoryService.getAll();
    
        res.status(201).json({data: data, message: 'Get all categories successfully'});
    }
    catch(err){
        console.error(err);

        res.status(500).json({ message: "Error getting all categories", error: err.message});
    }
});

export default router;