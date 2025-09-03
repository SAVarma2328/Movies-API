import { MovieRow, MovieSummary, MovieDetailsResponse, MovieRating } from '../types/movie.types';

function parseJsonField(field: string | null | undefined): any[] {
  if (!field) return [];
  
  try {
    const parsed = JSON.parse(field);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn('Failed to parse JSON field:', field, error);
    return [];
  }
}

function extractNames(items: any[]): string[] {
  if (!Array.isArray(items)) return [];
  
  return items.map(item => {
    if (typeof item === 'string') return item;
    if (item && typeof item === 'object' && item.name) return item.name;
    return String(item);
  }).filter(Boolean);
}

export function mapMovieRow(row: MovieRow): MovieSummary {
  const genresArray = parseJsonField(row.genres);
  const genreNames = extractNames(genresArray);
  
  return {
    movieId: row.movieId,
    imdbId: row.imdbId,
    title: row.title,
    genres: genreNames,
    releaseDate: row.releaseDate,
    budget: row.budget !== undefined ? `$${row.budget.toLocaleString()}` : undefined,
  };
}

export function mapMovieDetails(
  row: MovieRow,
  average_rating: number | null,
  ratings: MovieRating[]
): MovieDetailsResponse {
  const genresArray = parseJsonField(row.genres);
  const genreNames = extractNames(genresArray);
  
  const productionCompaniesArray = parseJsonField(row.productionCompanies);
  const companyNames = extractNames(productionCompaniesArray);
  
  return {
    imdb_id: row.imdbId,
    title: row.title,
    description: row.overview || '',
    release_date: row.releaseDate || '',
    budget: row.budget !== undefined ? `$${row.budget.toLocaleString()}` : '',
    runtime: row.runtime || 0,
    average_rating,
    genres: genreNames,
    original_language: row.language || '',
    production_companies: companyNames,
    ratings,
  };
}