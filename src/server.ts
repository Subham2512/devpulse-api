import { createApp } from './app.js';
import { env } from './config/env.js';
import { prisma } from './lib/prisma.js';

const app = createApp();

const server = app.listen(env.PORT, () => {
  console.log(`🚀 DevPulse API server running on http://localhost:${env.PORT}`);
  console.log(`📡 Environment: ${env.NODE_ENV}`);
});

const gracefulShutdown = async (signal: string) => {
  console.log(`\n🛑 Received ${signal}. Gracefully shutting down...`);
  server.close(async () => {
    console.log('🔒 Closed HTTP server');
    await prisma.$disconnect();
    console.log('💾 Disconnected Prisma client');
    process.exit(0);
  });

  setTimeout(() => {
    console.error('⚠️ Forcefully terminating process after 5s timeout');
    process.exit(1);
  }, 5000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
