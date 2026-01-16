import express from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { 
  getAllTechStackCategories, 
  getTechStackCategoryById, 
  createTechStackCategory, 
  updateTechStackCategory, 
  deleteTechStackCategory 
} from '../controllers/techStackCategoryController';

const router = express.Router();

// Public route for getting tech stack categories (no authentication required)
router.get('/public', getAllTechStackCategories);

// All admin tech stack categories routes require admin authentication
router.use(authenticateToken);
router.use(requireAdmin);

// Get all tech stack categories (admin only)
router.get('/', getAllTechStackCategories);

// Get a specific tech stack category
router.get('/:id', getTechStackCategoryById);

// Create a new tech stack category
router.post('/', createTechStackCategory);

// Update a tech stack category
router.put('/:id', updateTechStackCategory);

// Delete a tech stack category
router.delete('/:id', deleteTechStackCategory);

export default router;