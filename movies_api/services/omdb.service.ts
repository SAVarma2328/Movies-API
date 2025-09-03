import axios from 'axios';
import { MovieRating } from '../types/movie.types';
import { OMDBError } from '../errors/custom-error';
import { ERROR_MESSAGES } from '../constants/errors';
import { logger } from '../utils/logger';
import { config } from '../config/env';

export async function getRottenTomatoesRating(imdbId: string): Promise<MovieRating | null> {
  try {
    logger.info('Fetching Rotten Tomatoes rating from OMDB API', undefined, { 
      imdbId,
      hasApiKey: !!config.omdbApiKey,
      apiKeyLength: config.omdbApiKey.length
    });
    
    if (!config.omdbApiKey || config.omdbApiKey.trim() === '') {
      logger.warn('OMDB API key not configured - skipping Rotten Tomatoes rating', undefined, { 
        imdbId,
        envValue: process.env.OMDB_API_KEY ? 'SET_BUT_EMPTY' : 'NOT_SET'
      });
      return null;
    }
    
    const res = await axios.get('https://www.omdbapi.com/', {
      params: { 
        i: imdbId, 
        apikey: config.omdbApiKey.trim()
      },
      timeout: 10000, // 10 second timeout
    });
    
    logger.debug('OMDB API raw response', undefined, { 
      imdbId,
      response: res.data,
      status: res.status
    });
    
    // Check for OMDB API error responses
    if (res.data?.Response === 'False') {
      logger.warn('OMDB API returned error response', undefined, { 
        imdbId, 
        error: res.data.Error 
      });
      return null;
    }
    
    const rating = res.data?.Ratings?.find((r: any) => r.Source === 'Rotten Tomatoes');
    
    if (rating) {
      const movieRating: MovieRating = { 
        source: 'Rotten Tomatoes', 
        value: rating.Value 
      };
      
      logger.info('Successfully fetched Rotten Tomatoes rating', undefined, { 
        imdbId, 
        rating: rating.Value 
      });
      
      return movieRating;
    }
    
    logger.info('No Rotten Tomatoes rating found for movie', undefined, { 
      imdbId, 
      availableRatings: res.data?.Ratings?.map((r: any) => r.Source) || []
    });
    
    return null;
  } catch (error) {
    // If it's a network error or timeout, we log it but don't throw
    // This allows the application to continue without Rotten Tomatoes ratings
    if (axios.isAxiosError(error)) {
      logger.warn('Failed to fetch rating from OMDB API - continuing without rating', undefined, { 
        imdbId, 
        error: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        responseData: error.response?.data
      });
      return null;
    }
    
    logger.error('Unexpected error while fetching OMDB rating', error as Error, undefined, { imdbId });
    throw new OMDBError(ERROR_MESSAGES.OMDB_API_ERROR);
  }
}