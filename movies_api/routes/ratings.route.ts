import { Router } from 'express';
import { getRatings, getHeartbeat } from '../controllers/ratings.controller';

const router = Router();

// Routes
router.get('/heartbeat', getHeartbeat);
router.get('/:movieId', getRatings);

export default router;