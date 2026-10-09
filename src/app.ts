import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { requestLogger } from './middleware/requestLogger.js';
import { errorHandler } from './middleware/errorHandler.js';
import healthRoutes from './routes/healthRoutes.js';
import repoRoutes from './routes/repoRoutes.js';
import webhookRoutes from './routes/webhookRoutes.js';
import metricsRoutes from './routes/metricsRoutes.js';

export const createApp = (): express.Application => {
  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(express.json({ limit: '5mb' }));
  app.use(requestLogger);

  app.use('/', healthRoutes);
  app.use('/api/repositories', repoRoutes);
  app.use('/api/webhooks', webhookRoutes);
  app.use('/api/metrics', metricsRoutes);

  app.use((_req, res) => {
    res.status(404).json({
      success: false,
      error: 'Endpoint not found'
    });
  });

  app.use(errorHandler);

  return app;
};
