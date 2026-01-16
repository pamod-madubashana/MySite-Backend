import { Router } from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { getDashboardStats, getAnalytics } from '../controllers/dashboardController';
import { seedDatabase } from '../controllers/seedController';

const router = Router();

// All dashboard routes require admin authentication
router.use(authenticateToken);
router.use(requireAdmin);

// Get dashboard statistics
router.get('/stats', getDashboardStats);

// Get detailed analytics
router.get('/analytics', getAnalytics);

// Seed database with default values
router.post('/seed', seedDatabase);

export default router;