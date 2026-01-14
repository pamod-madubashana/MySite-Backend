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
router.get('/:id', getProjectById);

// Admin routes - requires authentication
router.use(authenticateToken);
router.use(requireAdmin);

router.get('/all', getAllProjects); // Get all projects (including drafts)
router.post('/', createProject);
router.put('/:id', updateProject);
router.delete('/:id', deleteProject);

export default router;