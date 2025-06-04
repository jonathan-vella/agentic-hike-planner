import { Router } from 'express';
import { TripsController } from '../controllers/TripsController';
import { authenticateToken } from '../middleware/auth';
import { validateRequest, schemas } from '../middleware/validation';

const router = Router();
const tripsController = new TripsController();

// All trips routes require authentication
router.use(authenticateToken);

// Trip routes
router.get('/', tripsController.getAllTrips);

router.post('/', 
  validateRequest({ body: schemas.createTrip }),
  tripsController.createTrip
);

router.get('/:id', 
  validateRequest({ params: schemas.idParam }),
  tripsController.getTripById
);

router.put('/:id', 
  validateRequest({ 
    params: schemas.idParam,
    body: schemas.updateTrip 
  }),
  tripsController.updateTrip
);

router.delete('/:id', 
  validateRequest({ params: schemas.idParam }),
  tripsController.deleteTrip
);

export default router;