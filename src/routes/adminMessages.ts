import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { replyToContactMessage } from '../controllers/contactController';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = Router();

const replyLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({ ok: false, error: 'Too many reply attempts. Please try again later.' });
  },
});

router.use(authenticateToken);
router.use(requireAdmin);

router.post('/messages/:id/reply', replyLimiter, replyToContactMessage);

export default router;
