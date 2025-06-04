import { Router } from 'express';
import { HealthController } from '../controllers/HealthController';

const router = Router();
const healthController = new HealthController();

// Health check routes
router.get('/', healthController.getHealth);
router.get('/detailed', healthController.getDetailedHealth);
router.get('/version', healthController.getVersion);

export default router;