import { Router } from 'express';
import { TrailsController } from '../controllers/TrailsController';
import { optionalAuth } from '../middleware/auth';
import { validateRequest, schemas } from '../middleware/validation';

const router = Router();
const trailsController = new TrailsController();

// Trails can be accessed without authentication, but user context is helpful
router.use(optionalAuth);

// Trail routes
router.get('/search', 
  validateRequest({ query: schemas.trailSearch }),
  trailsController.searchTrails
);

router.get('/recommendations', 
  trailsController.getRecommendations
);

router.get('/:id', 
  trailsController.getTrailById
);

export default router;