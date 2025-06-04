import { Router } from 'express';
import healthRouter from './health';
import tripsRouter from './trips';
import trailsRouter from './trails';
import userRouter from './user';

const router = Router();

// Mount route modules
router.use('/health', healthRouter);
router.use('/trips', tripsRouter);
router.use('/trails', trailsRouter);
router.use('/user', userRouter);

// Mount auth routes at /auth for compatibility (same as user routes)
router.use('/auth', userRouter);

export default router;