import express from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { 
  getAllTechSkills, 
  getTechSkillById, 
  createTechSkill, 
  updateTechSkill, 
  deleteTechSkill 
} from '../controllers/techSkillsController';

const router = express.Router();

// Public route for getting tech skills (no authentication required)
router.get('/public', getAllTechSkills);

// All admin tech skills routes require admin authentication
router.use(authenticateToken);
router.use(requireAdmin);

// Get all tech skills (admin only)
router.get('/', getAllTechSkills);

// Get a specific tech skill
router.get('/:id', getTechSkillById);

// Create a new tech skill
router.post('/', createTechSkill);

// Update a tech skill
router.put('/:id', updateTechSkill);

// Delete a tech skill
router.delete('/:id', deleteTechSkill);

export default router;