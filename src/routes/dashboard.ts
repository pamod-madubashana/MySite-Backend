import { Router } from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { getDashboardStats, getAnalytics } from '../controllers/dashboardController';

const router = Router();

// All dashboard routes require admin authentication
router.use(authenticateToken);
router.use(requireAdmin);

// Get dashboard statistics
router.get('/stats', getDashboardStats);

// Get detailed analytics
router.get('/analytics', getAnalytics);

export default router;