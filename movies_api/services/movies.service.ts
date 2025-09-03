import { getDb } from './db';
import { MovieRow } from '../types/movie.types';
import { NotFoundError, DatabaseError } from '../errors/custom-error';
import { ERROR_MESSAGES } from '../constants/errors';
import { logger } from '../utils/logger';

export async function getMovies(page: number, limit: number): Promise<MovieRow[]> {
  try {
    logger.info('Fetching movies from database', undefined, { page, limit });
    
    const offset = (page - 1) * limit;
    const db = await getDb();
    
    const rows = await db.all(
      `SELECT movieId, imdbId, title, genres, releaseDate, budget FROM movies LIMIT ? OFFSET ?`,
      [limit, offset]
    );
    
    logger.info('Successfully fetched movies from database', undefined, { 
      count: rows.length, 
      page, 
      limit 
    });
    
    return rows as MovieRow[];
  } catch (error) {
    logger.error('Failed to fetch movies from database', error as Error, undefined, { page, limit });
    throw new DatabaseError(ERROR_MESSAGES.MOVIES_FETCH_ERROR);
  }
}

export async function getMoviesCount(): Promise<number> {
  try {
    logger.info('Fetching total movies count from database');
    
    const db = await getDb();
    const row = await db.get<{ count: number }>(`SELECT COUNT(*) as count FROM movies`);
    const count = row?.count || 0;
    
    logger.info('Successfully fetched movies count', undefined, { count });
    
    return count;
  } catch (error) {
    logger.error('Failed to fetch movies count from database', error as Error);
    throw new DatabaseError(ERROR_MESSAGES.DATABASE_QUERY_ERROR);
  }
}

export async function getMovieById(imdbId: string): Promise<MovieRow> {
  try {
    logger.info('Fetching movie details by IMDB ID', undefined, { imdbId });
    
    const db = await getDb();
    const movie = await db.get<MovieRow>(
      `SELECT * FROM movies WHERE imdbId = ?`,
      [imdbId]
    );
    
    if (!movie) {
      logger.warn('Movie not found', undefined, { imdbId });
      throw new NotFoundError(ERROR_MESSAGES.MOVIE_NOT_FOUND);
    }
    
    logger.info('Successfully fetched movie details', undefined, { 
      imdbId, 
      title: movie.title 
    });
    
    return movie;
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    
    logger.error('Failed to fetch movie details', error as Error, undefined, { imdbId });
    throw new DatabaseError(ERROR_MESSAGES.MOVIE_DETAILS_FETCH_ERROR);
  }
}

export async function getMoviesByYear(
  year: number, 
  page: number, 
  limit: number, 
  sortOrder: 'asc' | 'desc' = 'asc'
): Promise<MovieRow[]> {
  try {
    logger.info('Fetching movies by year', undefined, { year, page, limit, sortOrder });
    
    const offset = (page - 1) * limit;
    const db = await getDb();
    const orderClause = sortOrder === 'desc' ? 'DESC' : 'ASC';
    
    const rows = await db.all(
      `SELECT movieId, imdbId, title, genres, releaseDate, budget 
       FROM movies 
       WHERE substr(releaseDate, 1, 4) = ? 
       ORDER BY releaseDate ${orderClause} 
       LIMIT ? OFFSET ?`,
      [year.toString(), limit, offset]
    );
    
    logger.info('Successfully fetched movies by year', undefined, { 
      year, 
      count: rows.length, 
      page, 
      limit,
      sortOrder 
    });
    
    return rows as MovieRow[];
  } catch (error) {
    logger.error('Failed to fetch movies by year', error as Error, undefined, { year, page, limit });
    throw new DatabaseError(ERROR_MESSAGES.MOVIES_FETCH_ERROR);
  }
}

export async function getMoviesByYearCount(year: number): Promise<number> {
  try {
    logger.info('Fetching movies count by year', undefined, { year });
    
    const db = await getDb();
    const row = await db.get<{ count: number }>(
      `SELECT COUNT(*) as count FROM movies WHERE substr(releaseDate, 1, 4) = ?`,
      [year.toString()]
    );
    const count = row?.count || 0;
    
    logger.info('Successfully fetched movies count by year', undefined, { year, count });
    
    return count;
  } catch (error) {
    logger.error('Failed to fetch movies count by year', error as Error, undefined, { year });
    throw new DatabaseError(ERROR_MESSAGES.DATABASE_QUERY_ERROR);
  }
}

export async function getMoviesByGenre(genre: string, page: number, limit: number): Promise<MovieRow[]> {
  try {
    logger.info('Fetching movies by genre', undefined, { genre, page, limit });
    
    const offset = (page - 1) * limit;
    const db = await getDb();
    
    const rows = await db.all(
      `SELECT movieId, imdbId, title, genres, releaseDate, budget 
       FROM movies 
       WHERE genres LIKE ? 
       LIMIT ? OFFSET ?`,
      [`%${genre}%`, limit, offset]
    );
    
    logger.info('Successfully fetched movies by genre', undefined, { 
      genre, 
      count: rows.length, 
      page, 
      limit 
    });
    
    return rows as MovieRow[];
  } catch (error) {
    logger.error('Failed to fetch movies by genre', error as Error, undefined, { genre, page, limit });
    throw new DatabaseError(ERROR_MESSAGES.MOVIES_FETCH_ERROR);
  }
}

export async function getMoviesByGenreCount(genre: string): Promise<number> {
  try {
    logger.info('Fetching movies count by genre', undefined, { genre });
    
    const db = await getDb();
    const row = await db.get<{ count: number }>(
      `SELECT COUNT(*) as count FROM movies WHERE genres LIKE ?`,
      [`%${genre}%`]
    );
    const count = row?.count || 0;
    
    logger.info('Successfully fetched movies count by genre', undefined, { genre, count });
    
    return count;
  } catch (error) {
    logger.error('Failed to fetch movies count by genre', error as Error, undefined, { genre });
    throw new DatabaseError(ERROR_MESSAGES.DATABASE_QUERY_ERROR);
  }
}