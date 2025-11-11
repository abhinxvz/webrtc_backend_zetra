import { Router } from 'express';
import { createRoom, joinRoom } from '../controllers/roomController';
import { authenticate } from '../middleware/auth';
import { validateRoomId, validateCreateRoom } from '../middleware/roomValidation';

const router = Router();

// Create a new room (authenticated users only)
router.post('/create', authenticate, validateCreateRoom, createRoom);

// Join an existing room by ID (authenticated users only)
router.post('/join/:roomId', authenticate, validateRoomId, joinRoom);

export default router;