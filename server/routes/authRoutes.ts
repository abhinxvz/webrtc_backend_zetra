import { Router } from 'express';
import { register, login } from '../controllers/authController';
import { validateRegistration, validateLogin } from '../middleware/validation';
import { rateLimiter } from '../middleware/rateLimiter';

const router = Router();

// Rate limit: 5 requests per 15 minutes for auth endpoints
const authLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 5,
  message: 'Too many authentication attempts, please try again later',
});

router.post('/register', authLimiter, validateRegistration, register);
router.post('/login', authLimiter, validateLogin, login);

export default router;
