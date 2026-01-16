import express from 'express';
import { getEnhancedDashboardData, getTimeline, getInterests, getTechSkills } from '../controllers/enhancedDashboardController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

router.get('/dashboard', authenticateToken, getEnhancedDashboardData);
router.get('/timeline', getTimeline);
router.get('/interests', getInterests);
router.get('/tech-skills', getTechSkills);

export default router;