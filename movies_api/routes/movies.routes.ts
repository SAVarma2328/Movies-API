import { Router } from 'express';
import {
  listAllMovies,
  getMovieDetails,
  listMoviesByYear,
  listMoviesByGenre,
} from '../controllers/movies.controller';

const router = Router();

// Routes
router.get('/', listAllMovies);
router.get('/details/:imdbId', getMovieDetails);
router.get('/year/:year', listMoviesByYear);
router.get('/genre', listMoviesByGenre);

export default router;