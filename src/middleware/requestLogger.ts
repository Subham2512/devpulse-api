import { Request, Response, NextFunction } from 'express';

export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const start = Date.now();
  const { method, originalUrl } = req;

  res.on('finish', () => {
    const duration = Date.now() - start;
    const statusCode = res.statusCode;
    if (process.env.NODE_ENV !== 'test') {
      console.log(`[${new Date().toISOString()}] ${method} ${originalUrl} ${statusCode} - ${duration}ms`);
    }
  });

  next();
};
