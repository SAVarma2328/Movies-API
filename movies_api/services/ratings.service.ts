import axios from 'axios';
import { MovieRating } from '../types/movie.types';
import { RatingsAPIError } from '../errors/custom-error';
import { ERROR_MESSAGES } from '../constants/errors';
import { logger } from '../utils/logger';
import { config } from '../config/env';
import { getDb } from './db';

// Helper function to get internal movieId from IMDB ID
async function getMovieIdFromImdbId(imdbId: string): Promise<number | null> {
  try {
    logger.debug('Looking up internal movieId for IMDB ID', undefined, { imdbId });
    
    const db = await getDb();
    const movie = await db.get('SELECT movieId FROM movies WHERE imdbId = ?', [imdbId]);
    
    if (movie?.movieId) {
      logger.debug('Found movieId mapping', undefined, { imdbId, movieId: movie.movieId });
      return movie.movieId;
    } else {
      logger.warn('No movieId found for IMDB ID', undefined, { imdbId });
      return null;
    }
  } catch (error) {
    logger.error('Failed to get movieId from IMDB ID', error as Error, undefined, { imdbId });
    return null;
  }
}

export async function getLocalRating(imdbId: string): Promise<MovieRating | null> {
  try {
    logger.info('Fetching rating from local ratings API', undefined, { 
      imdbId,
      ratingsApiUrl: config.ratingsApiUrl
    });
    
    // First, convert IMDB ID to internal movieId
    const movieId = await getMovieIdFromImdbId(imdbId);
    if (!movieId) {
      logger.warn('Could not find internal movieId for IMDB ID - no rating available', undefined, { imdbId });
      return null;
    }
    
    logger.debug('Using internal movieId for ratings lookup', undefined, { imdbId, movieId });
    
    // Use the internal movieId to fetch rating from the original ratings API
    const res = await axios.get(`${config.ratingsApiUrl}/ratings/${movieId}`, {
      timeout: 5000,
    });
    
    logger.debug('Local ratings API raw response', undefined, {
      imdbId,
      movieId,
      response: res.data,
      status: res.status
    });
    
    // The original ratings API returns an array of rating objects
    if (res.data && Array.isArray(res.data) && res.data.length > 0) {
      // Calculate average rating if multiple ratings exist
      const ratings = res.data;
      const averageRating = ratings.reduce((sum: number, r: any) => sum + r.rating, 0) / ratings.length;
      
      const rating: MovieRating = { 
        source: 'Local', 
        value: Number(averageRating.toFixed(1))
      };
      
      logger.info('Successfully fetched rating from local API', undefined, { 
        imdbId,
        movieId, 
        rating: averageRating,
        ratingsCount: ratings.length
      });
      
      return rating;
    }
    
    logger.warn('No valid rating data received from local API', undefined, { 
      imdbId,
      movieId, 
      responseData: res.data 
    });
    
    return null;
  } catch (error) {
    // If it's a network error or timeout, we log it but don't throw
    // This allows the application to continue without ratings
    if (axios.isAxiosError(error)) {
      logger.warn('Failed to fetch rating from local API - continuing without rating', undefined, { 
        imdbId, 
        error: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        code: error.code
      });
      return null;
    }
    
    logger.error('Unexpected error while fetching local rating', error as Error, undefined, { imdbId });
    throw new RatingsAPIError(ERROR_MESSAGES.RATINGS_API_ERROR);
  }
}