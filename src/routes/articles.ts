import { Router } from 'express';
import multer from 'multer';
import { 
  getAllArticles, 
  getArticleById, 
  createArticle, 
  updateArticle, 
  deleteArticle,
  getPublishedArticles,
  createArticleWithImage,
  updateArticleWithImage
} from '../controllers/articleController';
import { authenticateToken, requireAdmin } from '../middleware/auth';

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

// Public routes
router.get('/', getPublishedArticles);
router.get('/all', authenticateToken, requireAdmin, getAllArticles);
router.get('/:id', getArticleById);


// Admin routes
router.use(authenticateToken);
router.use(requireAdmin);


// Regular article routes (without image upload)
router.post('/', createArticle);
router.put('/:id', updateArticle);
router.delete('/:id', deleteArticle);

// Article routes with image upload capability
router.post('/upload', upload.single('featuredImage'), createArticleWithImage);
router.put('/upload/:id', upload.single('featuredImage'), updateArticleWithImage);

export default router;