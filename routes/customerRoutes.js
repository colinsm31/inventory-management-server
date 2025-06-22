import express from 'express';
import { 
  createCustomer,
  deleteCustomer,
  getAllCustomers, 
  getCustomerByID 
} from '../controllers/customerControllers.js';

const router = express.Router();

// GET all users
router.get('/', getAllCustomers);

// GET specific user with :id
router.get('/:id', getCustomerByID);

// POST new user
router.post('/', createCustomer);

// DELETE certain user
router.delete('/:id', deleteCustomer)

export default router;