import { Router } from 'express';
import { UserController, AuthController } from '../controllers/UserController';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const userController = new UserController();
const authController = new AuthController();

// Authentication routes (no auth required)
router.post('/auth/login', authController.login);
router.post('/auth/logout', authController.logout);
router.post('/auth/refresh', authController.refreshToken);

// User profile routes (authentication required)
router.get('/profile', authenticateToken, userController.getProfile);
router.put('/profile', authenticateToken, userController.updateProfile);
router.get('/statistics', authenticateToken, userController.getStatistics);
router.put('/preferences', authenticateToken, userController.updatePreferences);

export default router;