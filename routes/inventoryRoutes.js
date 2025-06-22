import express from 'express';
import { 
  addInventoryItem,
  getInventory, 
  getLocationInventory, 
  getProductInInventory 
} from '../controllers/inventoryControllers.js';

const router = express.Router();

// GET total inventory of all locations
router.get('/', getInventory);

// GET total inventory of specific location
router.get('/location/:location_id', getLocationInventory)

// GET specific product in inventory with :product_id
router.get('/product/:product_id', getProductInInventory);

// POST item into inventory
router.post('/', addInventoryItem);

export default router;