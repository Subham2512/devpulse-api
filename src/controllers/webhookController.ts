import { Request, Response, NextFunction } from 'express';
import { githubWebhookSchema } from '../validators/schemas.js';
import { webhookService } from '../services/webhookService.js';

export const handleGitHubWebhook = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const validated = githubWebhookSchema.parse(req.body);
    const result = await webhookService.handleGitHubWebhook(validated);

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};
