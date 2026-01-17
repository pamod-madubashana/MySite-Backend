import { Router } from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { 
  getPublishedProjects, 
  getAllProjects, 
  getProjectById, 
  createProject, 
  updateProject, 
  deleteProject,
  createProjectWithImage,
  updateProjectWithImage
} from '../controllers/projectController';
import multer from 'multer';

// Configure multer for handling multipart/form-data
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

const router = Router();

// Public routes - only published projects
router.get('/', getPublishedProjects);

// Specific route for 'all' to avoid conflict with :id parameter
router.get('/all', authenticateToken, requireAdmin, getAllProjects); // Get all projects (including drafts) - requires auth

// Route for specific project by ID - must come after /all to avoid conflict
router.get('/:id', getProjectById); // Get specific project by ID - public

// Admin routes for CRUD operations
// Regular project routes (without image upload)
router.post('/', authenticateToken, requireAdmin, createProject);
router.put('/:id', authenticateToken, requireAdmin, updateProject);
router.delete('/:id', authenticateToken, requireAdmin, deleteProject);

// Project routes with image upload capability
// Handle both thumbnail and screenshots for creation
router.post('/upload', authenticateToken, requireAdmin, upload.fields([
  { name: 'thumbnail', maxCount: 1 },
  { name: 'screenshots', maxCount: 10 }
]), createProjectWithImage);

// Handle both thumbnail and screenshots for updates
router.put('/upload/:id', authenticateToken, requireAdmin, upload.fields([
  { name: 'thumbnail', maxCount: 1 },
  { name: 'screenshots', maxCount: 10 }
]), updateProjectWithImage);

export default router;