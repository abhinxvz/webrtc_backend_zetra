import { Router } from 'express';
import { getUserProfile, updateUserProfile, deleteUserAccount } from '../controllers/userController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Get logged-in user's profile
router.get('/profile', authenticateToken, getUserProfile);

// Update logged-in user's profile
router.put('/profile', authenticateToken, updateUserProfile);

// Delete user account
router.delete('/account', authenticateToken, deleteUserAccount);

export default router;