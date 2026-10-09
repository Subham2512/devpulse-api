import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';

export const getHealth = async (_req: Request, res: Response): Promise<void> => {
  let dbStatus = 'healthy';

  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch (error) {
    dbStatus = 'unreachable';
  }

  res.status(dbStatus === 'healthy' ? 200 : 503).json({
    status: dbStatus === 'healthy' ? 'pass' : 'fail',
    timestamp: new Date().toISOString(),
    services: {
      api: 'healthy',
      database: dbStatus
    },
    version: '1.0.0'
  });
};
