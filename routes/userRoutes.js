import express from 'express';
import {
  createUser,
  deleteUser,
  getAllUsers,
  getUserByID,
  getUsersByRole
} from '../controllers/userControllers.js';

const router = express.Router();

// GET all users
router.get('/', getAllUsers);

// GET specific user with :id
router.get('/id/:id', getUserByID);

// GET specific user with :role
router.get('/role/:role', getUsersByRole);

// POST new user
router.post('/', createUser);

// DELETE certain user
router.delete('/:id', deleteUser)

export default router;