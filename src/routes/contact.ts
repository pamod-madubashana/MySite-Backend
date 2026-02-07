import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import {
  getContactMessages,
  submitContactMessage,
  updateContactMessageStatus,
} from '../controllers/contactController';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = Router();

const contactLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({ ok: false, error: 'Too many requests. Please try again later.' });
  },
});

router.post('/', contactLimiter, submitContactMessage);

router.get('/messages', authenticateToken, requireAdmin, getContactMessages);
router.patch('/messages/:id/status', authenticateToken, requireAdmin, updateContactMessageStatus);

export default router;
