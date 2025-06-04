import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config, validateConfig } from './config';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { logger, correlationIdMiddleware, structuredLogger } from './middleware/logger';
import routes from './routes';

// Validate configuration on startup
validateConfig();

const app = express();
const PORT = config.port;

// Trust proxy (for proper IP forwarding in Azure App Service)
app.set('trust proxy', 1);

// Core middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ['\'self\''],
      styleSrc: ['\'self\'', '\'unsafe-inline\''],
      scriptSrc: ['\'self\''],
      imgSrc: ['\'self\'', 'data:', 'https:'],
    },
  },
}));

app.use(cors(config.cors));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging and correlation
app.use(correlationIdMiddleware);
app.use(logger);

// Health check endpoint (outside of /api for load balancers)
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: config.api.version,
  });
});

// API routes
app.use('/api', routes);

// Handle 404 for unknown routes
app.use(notFoundHandler);

// Global error handling
app.use(errorHandler);

// Graceful shutdown handling
const server = app.listen(PORT, () => {
  structuredLogger.info('Server started successfully', {
    port: PORT,
    environment: config.nodeEnv,
    version: config.api.version,
  });
});

// Handle shutdown signals
const shutdown = (signal: string) => {
  structuredLogger.info(`Received ${signal}, shutting down gracefully`);
  
  server.close((err) => {
    if (err) {
      structuredLogger.error('Error during server shutdown', err);
      process.exit(1);
    }
    
    structuredLogger.info('Server closed successfully');
    process.exit(0);
  });
  
  // Force shutdown after 30 seconds
  setTimeout(() => {
    structuredLogger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 30000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  structuredLogger.error('Unhandled Promise Rejection', new Error(String(reason)), {
    promise: promise.toString(),
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  structuredLogger.error('Uncaught Exception', error);
  process.exit(1);
});

export default app;