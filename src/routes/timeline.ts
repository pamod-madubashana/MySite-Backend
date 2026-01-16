import express from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { 
  getAllTimelineItems, 
  getTimelineItemById, 
  createTimelineItem, 
  updateTimelineItem, 
  deleteTimelineItem 
} from '../controllers/timelineController';

const router = express.Router();

// Public route for getting timeline items (no authentication required)
router.get('/public', getAllTimelineItems);

// All admin timeline routes require admin authentication
router.use(authenticateToken);
router.use(requireAdmin);

// Get all timeline items (admin only)
router.get('/', getAllTimelineItems);

// Get a specific timeline item
router.get('/:id', getTimelineItemById);

// Create a new timeline item
router.post('/', createTimelineItem);

// Update a timeline item
router.put('/:id', updateTimelineItem);

// Delete a timeline item
router.delete('/:id', deleteTimelineItem);

export default router;