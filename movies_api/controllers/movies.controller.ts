import { Request, Response } from 'express';
import {
  getMovies,
  getMoviesCount,
  getMovieById,
  getMoviesByYear,
  getMoviesByYearCount,
  getMoviesByGenre,
  getMoviesByGenreCount,
} from '../services/movies.service';
import { getLocalRating } from '../services/ratings.service';
import { getRottenTomatoesRating } from '../services/omdb.service';
import { mapMovieRow, mapMovieDetails } from '../mappers/movies.mapper';
import { validatePageQuery, validateYearQuery, validateSortOrder } from '../validators/movies.validator';
import { MovieListResponse, MovieRating } from '../types/movie.types';
import { AppError, ValidationError } from '../errors/custom-error';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../constants/errors';
import { logger, LogContext } from '../utils/logger';

export async function listAllMovies(req: Request, res: Response): Promise<void> {
  const startTime = Date.now();
  let logContext: LogContext;

  try {
    logContext = logger.logRequest(
      req, 
      'Received request to list all movies', 
      { 
        page: req.query.page,
        queryParams: req.query 
      }
    );

    // Validation
    if (!validatePageQuery(req.query.page)) {
      throw new ValidationError(ERROR_MESSAGES.INVALID_PAGE_PARAMETER);
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = 50;

    logger.info('Fetching movies and count', logContext, { page, limit });

    const [movies, totalCount] = await Promise.all([
      getMovies(page, limit),
      getMoviesCount(),
    ]);

    const response: MovieListResponse = {
      movies: movies.map(mapMovieRow),
      page,
      totalPages: Math.ceil(totalCount / limit),
      totalCount,
    };

    const duration = Date.now() - startTime;
    logger.logResponse(
      logContext, 
      SUCCESS_MESSAGES.MOVIES_FETCHED, 
      { 
        moviesCount: movies.length, 
        totalCount, 
        totalPages: response.totalPages,
        page 
      }, 
      duration
    );

    res.status(200).json({
      success: true,
      message: SUCCESS_MESSAGES.MOVIES_FETCHED,
      data: response,
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    
    if (error instanceof AppError) {
      logger.logError(
        logContext!, 
        `Validation/Business error in listAllMovies: ${error.message}`, 
        error,
        { duration }
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
        'Unexpected error in listAllMovies', 
        error as Error,
        { duration }
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

export async function getMovieDetails(req: Request, res: Response): Promise<void> {
  const startTime = Date.now();
  let logContext: LogContext;

  try {
    const { imdbId } = req.params;
    
    logContext = logger.logRequest(
      req, 
      'Received request to get movie details', 
      { imdbId }
    );

    if (!imdbId) {
      throw new ValidationError(ERROR_MESSAGES.IMDB_ID_REQUIRED);
    }

    logger.info('Fetching movie details and ratings', logContext, { imdbId });

    // Fetch movie details
    const movie = await getMovieById(imdbId);

    // Fetch ratings in parallel
    const [localRating, rtRating] = await Promise.all([
      getLocalRating(imdbId).catch(err => {
        logger.warn('Failed to fetch local rating, continuing without it', logContext, { 
          imdbId, 
          error: err.message 
        });
        return null;
      }),
      getRottenTomatoesRating(imdbId).catch(err => {
        logger.warn('Failed to fetch Rotten Tomatoes rating, continuing without it', logContext, { 
          imdbId, 
          error: err.message 
        });
        return null;
      }),
    ]);

    // Calculate average rating (from local API)
    const average_rating = localRating ? Number(localRating.value) : null;
    const ratings = [localRating, rtRating].filter((rating): rating is MovieRating => rating !== null);

    const responseData = mapMovieDetails(movie, average_rating, ratings);

    const duration = Date.now() - startTime;
    logger.logResponse(
      logContext, 
      SUCCESS_MESSAGES.MOVIE_DETAILS_FETCHED, 
      { 
        imdbId,
        title: movie.title,
        ratingsCount: ratings.length,
        hasLocalRating: !!localRating,
        hasRTRating: !!rtRating
      }, 
      duration
    );

    res.status(200).json({
      success: true,
      message: SUCCESS_MESSAGES.MOVIE_DETAILS_FETCHED,
      data: responseData,
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    
    if (error instanceof AppError) {
      logger.logError(
        logContext!, 
        `Business error in getMovieDetails: ${error.message}`, 
        error,
        { imdbId: req.params.imdbId, duration }
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
        'Unexpected error in getMovieDetails', 
        error as Error,
        { imdbId: req.params.imdbId, duration }
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

export async function listMoviesByYear(req: Request, res: Response): Promise<void> {
  const startTime = Date.now();
  let logContext: LogContext;

  try {
    const { year: yearParam } = req.params;
    const { page: pageParam, order: orderParam } = req.query;
    
    logContext = logger.logRequest(
      req, 
      'Received request to list movies by year', 
      { 
        year: yearParam,
        page: pageParam,
        order: orderParam
      }
    );

    // Validation
    if (!validateYearQuery(yearParam)) {
      throw new ValidationError(ERROR_MESSAGES.INVALID_YEAR_PARAMETER);
    }

    if (!validatePageQuery(pageParam)) {
      throw new ValidationError(ERROR_MESSAGES.INVALID_PAGE_PARAMETER);
    }

    if (!validateSortOrder(orderParam)) {
      throw new ValidationError(ERROR_MESSAGES.INVALID_SORT_ORDER);
    }

    const year = parseInt(yearParam);
    const page = parseInt(pageParam as string) || 1;
    const sortOrder = (orderParam as string) || 'asc';
    const limit = 50;

    logger.info('Fetching movies by year and count', logContext, { 
      year, 
      page, 
      limit, 
      sortOrder 
    });

    const [movies, totalCount] = await Promise.all([
      getMoviesByYear(year, page, limit, sortOrder as 'asc' | 'desc'),
      getMoviesByYearCount(year),
    ]);

    const response: MovieListResponse = {
      movies: movies.map(mapMovieRow),
      page,
      totalPages: Math.ceil(totalCount / limit),
      totalCount,
    };

    const duration = Date.now() - startTime;
    logger.logResponse(
      logContext, 
      SUCCESS_MESSAGES.MOVIES_BY_YEAR_FETCHED, 
      { 
        year,
        moviesCount: movies.length, 
        totalCount, 
        totalPages: response.totalPages,
        page,
        sortOrder 
      }, 
      duration
    );

    res.status(200).json({
      success: true,
      message: SUCCESS_MESSAGES.MOVIES_BY_YEAR_FETCHED,
      data: response,
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    
    if (error instanceof AppError) {
      logger.logError(
        logContext!, 
        `Business error in listMoviesByYear: ${error.message}`, 
        error,
        { year: req.params.year, duration }
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
        'Unexpected error in listMoviesByYear', 
        error as Error,
        { year: req.params.year, duration }
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

export async function listMoviesByGenre(req: Request, res: Response): Promise<void> {
  const startTime = Date.now();
  let logContext: LogContext;

  try {
    const { genre } = req.query;
    const { page: pageParam } = req.query;
    
    logContext = logger.logRequest(
      req, 
      'Received request to list movies by genre', 
      { 
        genre,
        page: pageParam
      }
    );

    // Validation
    if (!genre) {
      throw new ValidationError(ERROR_MESSAGES.GENRE_REQUIRED);
    }

    if (!validatePageQuery(pageParam)) {
      throw new ValidationError(ERROR_MESSAGES.INVALID_PAGE_PARAMETER);
    }

    const genreStr = genre as string;
    const page = parseInt(pageParam as string) || 1;
    const limit = 50;

    logger.info('Fetching movies by genre and count', logContext, { 
      genre: genreStr, 
      page, 
      limit 
    });

    const [movies, totalCount] = await Promise.all([
      getMoviesByGenre(genreStr, page, limit),
      getMoviesByGenreCount(genreStr),
    ]);

    const response: MovieListResponse = {
      movies: movies.map(mapMovieRow),
      page,
      totalPages: Math.ceil(totalCount / limit),
      totalCount,
    };

    const duration = Date.now() - startTime;
    logger.logResponse(
      logContext, 
      SUCCESS_MESSAGES.MOVIES_BY_GENRE_FETCHED, 
      { 
        genre: genreStr,
        moviesCount: movies.length, 
        totalCount, 
        totalPages: response.totalPages,
        page 
      }, 
      duration
    );

    res.status(200).json({
      success: true,
      message: SUCCESS_MESSAGES.MOVIES_BY_GENRE_FETCHED,
      data: response,
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    
    if (error instanceof AppError) {
      logger.logError(
        logContext!, 
        `Business error in listMoviesByGenre: ${error.message}`, 
        error,
        { genre: req.query.genre, duration }
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
        'Unexpected error in listMoviesByGenre', 
        error as Error,
        { genre: req.query.genre, duration }
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