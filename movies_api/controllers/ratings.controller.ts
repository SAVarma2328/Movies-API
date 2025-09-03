import { Request, Response } from 'express';
import { getRatingsDb } from '../services/db';
import { AppError, NotFoundError, DatabaseError } from '../errors/custom-error';
import { ERROR_MESSAGES } from '../constants/errors';
import { logger, LogContext } from '../utils/logger';

export async function getRatings(req: Request, res: Response): Promise<void> {
  const startTime = Date.now();
  let logContext: LogContext;

  try {
    const { movieId } = req.params;
    
    logContext = logger.logRequest(
      req, 
      'Received request to get ratings for movie', 
      { movieId }
    );

    if (!movieId) {
      throw new AppError('Movie ID is required', 'VALIDATION_ERROR', 400);
    }

    logger.info('Fetching ratings from ratings database', logContext, { movieId });

    const db = await getRatingsDb();
    
    // Get ratings for the specific movieId
    const ratings = await db.all(
      'SELECT * FROM ratings WHERE movieId = ?', 
      [parseInt(movieId)]
    );

    if (!ratings || ratings.length === 0) {
      logger.warn('No ratings found for movieId', logContext, { movieId });
      throw new NotFoundError(`No ratings found for movieId: ${movieId}`);
    }

    const duration = Date.now() - startTime;
    logger.logResponse(
      logContext, 
      'Ratings fetched successfully', 
      { 
        movieId,
        ratingsCount: ratings.length
      }, 
      duration
    );

    res.status(200).json(ratings);
  } catch (error) {
    const duration = Date.now() - startTime;
    
    if (error instanceof AppError) {
      logger.logError(
        logContext!, 
        `Business error in getRatings: ${error.message}`, 
        error,
        { movieId: req.params.movieId, duration }
      );
      
      res.status(error.statusCode).json({
        success: false,
        error: {
          code: error.code,
          message: error.message,
        },
      });
    } else {
      logger.logError(
        logContext!, 
        'Unexpected error in getRatings', 
        error as Error,
        { movieId: req.params.movieId, duration }
      );
      
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        },
      });
    }
  }
}

export async function getHeartbeat(req: Request, res: Response): Promise<void> {
  res.status(200).json({
    success: true,
    message: 'Have fun with the project!',
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
}