import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config/env';
import { errorHandler } from './shared/middleware/errorHandler';
import { logger } from './shared/utils/logger/logger';
import { userRoutes } from './modules/user/user.routes';
import { authRoutes} from './modules/auth/auth.routes';

export const createApp = () => {
  const app = express();

  // Security
  app.use(helmet());
  app.use(cors({ origin: config.security.corsOrigin }));
  
  // Logging
  if (config.env !== 'production') {
    app.use(morgan('dev'));
  }
  
  // Body parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Health check
  app.get('/health', (req, res) => {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: config.apiVersion,
      env: config.env,
    });
  });

  // API routes will be added here
  // app.use(`/api/${config.apiVersion}/auth`, authRouter);
  app.use('/api/users/', userRoutes);
  app.use('/api/auth/', authRoutes);





  // Error handling
  app.use(errorHandler);

  return app;
};