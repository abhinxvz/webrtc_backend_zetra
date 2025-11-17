import { Router } from 'express';
import {
  createMeetingSummary,
  getMeetingSummaries,
  getMeetingSummaryById,
  deleteMeetingSummary,
} from '../controllers/meetingSummaryController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.post('/', authenticateToken, createMeetingSummary);
router.get('/user/:userId', authenticateToken, getMeetingSummaries);
router.get('/:id', authenticateToken, getMeetingSummaryById);
router.delete('/:id', authenticateToken, deleteMeetingSummary);

export default router;
