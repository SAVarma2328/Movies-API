import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 4000,
  omdbApiKey: process.env.OMDB_API_KEY || '',
  nodeEnv: process.env.NODE_ENV || 'development',
  ratingsApiUrl: process.env.RATINGS_API_URL || 'http://localhost:3000',
};

// console.log('Environment configuration loaded:', {
//   port: config.port,
//   omdbApiKey: config.omdbApiKey ? `${config.omdbApiKey.substring(0, 4)}****` : 'NOT_SET',
//   nodeEnv: config.nodeEnv,
//   ratingsApiUrl: config.ratingsApiUrl,
// });