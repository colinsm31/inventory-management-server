import express from 'express';
import { 
  createLocation, 
  deleteLocation, 
  getAllLocations, 
  getLocationByID, 
  getLocationByCity, 
  getLocationByState 
} from '../controllers/locationControllers.js';

const router = express.Router();

// GET all locations
router.get('/', getAllLocations);

// GET specific location with :id
router.get('/id/:id', getLocationByID);

// GET specific location with :city
router.get('/city/:city', getLocationByCity);

// GET specific location with :state
router.get('/state/:state', getLocationByState);

// POST new location
router.post('/', createLocation);

// DELETE certain location
router.delete('/:id', deleteLocation)

export default router;