export const ERROR_CODES = {
  NOT_FOUND: 'NOT_FOUND',
  DB_ERROR: 'DB_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  OMDB_ERROR: 'OMDB_ERROR',
  RATINGS_API_ERROR: 'RATINGS_API_ERROR',
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  BAD_REQUEST: 'BAD_REQUEST',
  UNKNOWN: 'UNKNOWN',
} as const;

export const ERROR_MESSAGES = {
  // Movie related errors
  MOVIE_NOT_FOUND: 'Movie not found with the provided IMDB ID',
  MOVIES_FETCH_ERROR: 'Failed to fetch movies from database',
  MOVIE_DETAILS_FETCH_ERROR: 'Failed to fetch movie details',
  
  // Validation errors
  INVALID_PAGE_PARAMETER: 'Page parameter must be a positive integer',
  INVALID_YEAR_PARAMETER: 'Year parameter must be between 1800 and 2100',
  INVALID_SORT_ORDER: 'Sort order must be either "asc" or "desc"',
  GENRE_REQUIRED: 'Genre parameter is required',
  IMDB_ID_REQUIRED: 'IMDB ID is required',
  
  // Database errors
  DATABASE_CONNECTION_ERROR: 'Failed to connect to database',
  DATABASE_QUERY_ERROR: 'Database query execution failed',
  
  // External API errors
  OMDB_API_ERROR: 'Failed to fetch data from OMDB API',
  RATINGS_API_ERROR: 'Failed to fetch ratings from local ratings API',
  
  // Generic errors
  INTERNAL_SERVER_ERROR: 'An internal server error occurred',
  BAD_REQUEST: 'Invalid request parameters',
  UNKNOWN_ERROR: 'An unknown error occurred',
} as const;

export const SUCCESS_MESSAGES = {
  MOVIES_FETCHED: 'Movies fetched successfully',
  MOVIE_DETAILS_FETCHED: 'Movie details fetched successfully',
  MOVIES_BY_YEAR_FETCHED: 'Movies by year fetched successfully',
  MOVIES_BY_GENRE_FETCHED: 'Movies by genre fetched successfully',
} as const;