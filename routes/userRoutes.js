import express from 'express';
import {
  createUser,
  deleteUser,
  getAllUsers,
  getUserAccessibleLocations,
  getUserByID,
  getUserByIDWithLocations,
  getUsersByRole,
  getUsersWithLocations,
  revokeUserAccessToLocation,
  updateUser
} from '../controllers/userControllers.js';

const router = express.Router();

// GET all users
router.get('/', getAllUsers);

// GET all users with accessible locations
router.get('/users-with-locations', getUsersWithLocations);

// GET specific user with :id
router.get('/id/:id', getUserByID);

// GET user with accessible locations
router.get('/users-with-locations/:id', getUserByIDWithLocations);

// GET users with :role
router.get('/role/:role', getUsersByRole);

// POST new user
router.post('/', createUser);

// PATCH existing user
router.patch('/id/:id', updateUser);

// DELETE certain user
router.delete('/:id', deleteUser)

// GET locations user can access
router.get('/:id/locations', getUserAccessibleLocations);

// DELETE user from location
router.delete('/:id/locations', revokeUserAccessToLocation);

export default router;