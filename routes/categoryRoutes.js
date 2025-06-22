import express from 'express';
import { createCategory, deleteCategory, getAllCategories, getCategoryByID } from '../controllers/categoryControllers.js';

const router = express.Router();

// GET all Categorys
router.get('/', getAllCategories);

// GET specific Category with :id
router.get('/:id', getCategoryByID);

// POST new Category
router.post('/', createCategory);

// DELETE certain Category
router.delete('/:id', deleteCategory)

export default router;