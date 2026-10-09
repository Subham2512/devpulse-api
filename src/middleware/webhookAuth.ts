import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { env } from '../config/env.js';

export const verifyWebhookSignature = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const signature = req.headers['x-hub-signature-256'] as string | undefined;

  if (!env.WEBHOOK_SECRET || env.NODE_ENV === 'test') {
    return next();
  }

  if (!signature) {
    res.status(401).json({
      success: false,
      error: 'Missing x-hub-signature-256 header'
    });
    return;
  }

  const payload = JSON.stringify(req.body);
  const hmac = crypto.createHmac('sha256', env.WEBHOOK_SECRET);
  const digest = `sha256=${hmac.update(payload).digest('hex')}`;

  const sigBuffer = Buffer.from(signature);
  const digestBuffer = Buffer.from(digest);

  if (
    sigBuffer.length !== digestBuffer.length ||
    !crypto.timingSafeEqual(sigBuffer, digestBuffer)
  ) {
    res.status(401).json({
      success: false,
      error: 'Invalid webhook signature'
    });
    return;
  }

  next();
};
