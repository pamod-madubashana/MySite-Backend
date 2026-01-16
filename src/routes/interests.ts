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

// Public route for getting interests (no authentication required)
router.get('/public', getAllInterests);

// All admin interests routes require admin authentication
router.use(authenticateToken);
router.use(requireAdmin);

// Get all interests (admin only)
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