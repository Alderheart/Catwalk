import dotenv from 'dotenv';
import { app } from './lambda/handler';

// Load environment variables for local development
dotenv.config();

const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Set environment for local development
process.env.NODE_ENV = NODE_ENV;

const server = app.listen(PORT, () => {
  console.log('🚀 Cat Colony Backend Started');
  console.log(`📍 Environment: ${NODE_ENV}`);
  console.log(`🔗 Server running at: http://localhost:${PORT}`);
  console.log(`🔗 API available at: http://localhost:${PORT}/api/v1`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/v1/health`);
  console.log('');
  console.log('Available endpoints:');
  console.log('  GET  /api/v1/health');
  console.log('  GET  /api/v1/cats');
  console.log('  POST /api/v1/cats');
  console.log('  GET  /api/v1/cats/:catId');
  console.log('  PATCH /api/v1/cats/:catId');
  console.log('');
});

// Graceful shutdown handlers
const gracefulShutdown = (signal: string) => {
  console.log(`\n📡 ${signal} received: closing HTTP server...`);
  server.close(() => {
    console.log('✅ HTTP server closed');
    process.exit(0);
  });
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

export default server;