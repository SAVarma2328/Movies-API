import dotenv from 'dotenv';

dotenv.config();

import express from 'express';
import moviesRouter from './routes/movies.routes';
import ratingsRouter from './routes/ratings.route';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler';
import { logger } from './utils/logger';
import { config } from './config/env';

const app = express();

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use((req, res, next) => {
  logger.info('Incoming request', {
    transactionId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    method: req.method,
    url: req.originalUrl,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
    timestamp: new Date().toISOString(),
  }, {
    headers: req.headers,
    query: req.query,
    body: req.method !== 'GET' ? req.body : undefined,
  });
  next();
});

app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Movies API is healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    config: {
      hasOMDBKey: !!config.omdbApiKey,
      ratingsApiUrl: config.ratingsApiUrl,
      nodeEnv: config.nodeEnv,
    }
  });
});

app.use('/movies', moviesRouter);
app.use('/ratings', ratingsRouter);


app.use('*', notFoundHandler);

app.use(errorHandler);

process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT signal received: closing HTTP server');
  process.exit(0);
});

app.listen(config.port, () => {
  logger.info(`Movies API server started successfully`, undefined, {
    port: config.port,
    environment: config.nodeEnv,
    hasOMDBKey: !!config.omdbApiKey,
    omdbKeyLength: config.omdbApiKey.length,
    timestamp: new Date().toISOString(),
  });
});

export default app;