import http from 'node:http';
import { app } from './app';
import { config } from './config/environment';
import { logger } from './shared/logger/logger';

const server = http.createServer(app);

const shutdown = (): void => {
  logger.info('Server is shutting down gracefully');
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

server.listen(config.port, () => {
  logger.info(`Server listening on port ${config.port}`);
});
