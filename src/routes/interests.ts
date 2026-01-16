import express from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { 
  getAllInterests, 
  getInterestById, 
  createInterest, 
  updateInterest, 
  deleteInterest 
} from '../controllers/interestsController';

const router = express.Router();

// All interests routes require admin authentication
router.use(authenticateToken);
router.use(requireAdmin);

// Get all interests
router.get('/', getAllInterests);

// Get a specific interest
router.get('/:id', getInterestById);

// Create a new interest
router.post('/', createInterest);

// Update an interest
router.put('/:id', updateInterest);

// Delete an interest
router.delete('/:id', deleteInterest);

export default router;