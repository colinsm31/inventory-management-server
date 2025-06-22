import express from 'express';
import { 
  createProduct,
  getAllProducts,
  getProductByCategory,
  getProductByID,
} from '../controllers/productController.js';

const router = express.Router();

// GET all products
router.get('/', getAllProducts);

// GET product by :id
router.get('/id/:id', getProductByID);

// GET product by category_id
router.get('/category/:category_id', getProductByCategory);

// POST new product
router.post('/', createProduct);

export default router;