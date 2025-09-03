export interface MovieRow {
  movieId: number;
  imdbId: string;
  title: string;
  overview?: string;
  productionCompanies?: string;
  releaseDate?: string;
  budget?: number;
  revenue?: number;
  runtime?: number;
  language?: string;
  genres?: string;
  status?: string;
}

export interface MovieSummary {
  movieId: number;
  imdbId: string;
  title: string;
  genres: string[];
  releaseDate?: string;
  budget?: string;
}

export interface MovieListResponse {
  movies: MovieSummary[];
  page: number;
  totalPages: number;
  totalCount: number;
}

export interface MovieDetailsResponse {
  imdb_id: string;
  title: string;
  description: string;
  release_date: string;
  budget: string;
  runtime: number;
  average_rating: number | null;
  genres: string[];
  original_language: string;
  production_companies: string[];
  ratings: MovieRating[];
}

export interface MovieRating {
  source: string;
  value: number | string;
}