import express from 'express';
import * as categoryService from '../services/category.service.js';
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

/**
 * Add new category
 */
router.post('/', async (req, res) => {
    try {
        const data = await categoryService.addNewCategory(req.body.description);

        res.status(201).json({
            success: true,
            message: 'Add category successfully',
            data
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: 'Error adding category',
            data: null
        });
    }
});

/**
 * Update category
 */
router.put('/', async (req, res) => {
    try {
        const data = await categoryService.updateCategory(req.body);

        res.status(200).json({
            success: true,
            message: 'Update category successfully',
            data
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: 'Error updating category',
            data: null
        });
    }
});

/**
 * Delete category
 */
router.delete('/', async (req, res) => {
    try {
        const data = await categoryService.deleteCategory(req.body.id);

        res.status(200).json({
            success: true,
            message: 'Delete category successfully',
            data
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: 'Error deleting category',
            data: null
        });
    }
});

/**
 * Get all categories
 */
router.get('/all', async (req, res) => {
    try {
        const data = await categoryService.getAll();

        res.status(200).json({
            success: true,
            message: 'Get all categories successfully',
            data
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: 'Error getting all categories',
            data: null
        });
    }
});

/**
 * Get child categories
 */
router.get('/child/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const data = await categoryService.getChild(id);

        res.status(200).json({
            success: true,
            message: 'Get child categories successfully',
            data
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: 'Error getting child categories',
            data: null
        });
    }
});

/**
 * Get parent categories
 */
router.get('/allParent', async (req, res) => {
    try {
        const data = await categoryService.getParent();

        res.status(200).json({
            success: true,
            message: 'Get all parent categories successfully',
            data
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: 'Error getting parent categories',
            data: null
        });
    }
});

/**
 * Get category by id
 */
router.get('/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const data = await categoryService.getCategoryById(id);

        res.status(200).json({
            success: true,
            message: 'Get category by id successfully',
            data
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: 'Error getting category by id',
            data: null
        });
    }
});

export default router;
