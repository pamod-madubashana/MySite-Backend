import { Router } from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { 
  getPublishedProjects, 
  getAllProjects, 
  getProjectById, 
  createProject, 
  updateProject, 
  deleteProject 
} from '../controllers/projectController';

const router = Router();

// Public routes - only published projects
router.get('/', getPublishedProjects);

// Specific route for 'all' to avoid conflict with :id parameter
router.get('/all', authenticateToken, requireAdmin, getAllProjects); // Get all projects (including drafts) - requires auth

// Route for specific project by ID - must come after /all to avoid conflict
router.get('/:id', getProjectById); // Get specific project by ID - public

// Admin routes for CRUD operations
router.post('/', authenticateToken, requireAdmin, createProject);
router.put('/:id', authenticateToken, requireAdmin, updateProject);
router.delete('/:id', authenticateToken, requireAdmin, deleteProject);

export default router;