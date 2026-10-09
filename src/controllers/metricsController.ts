import { Request, Response, NextFunction } from 'express';
import { metricsService } from '../services/metricsService.js';
import { riskScoringService } from '../services/riskScoringService.js';
import { calculateRiskSchema, turnaroundQuerySchema } from '../validators/schemas.js';

export const getRepositoryOverview = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { repoId } = req.params;
    const overview = await metricsService.getRepositoryOverview(repoId);

    res.json({
      success: true,
      data: overview
    });
  } catch (error) {
    next(error);
  }
};

export const getTurnaroundMetrics = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { repoId } = req.params;
    const { days } = turnaroundQuerySchema.parse(req.query);
    const metrics = await metricsService.getTurnaroundMetrics(repoId, days);

    res.json({
      success: true,
      data: metrics
    });
  } catch (error) {
    next(error);
  }
};

export const calculateRisk = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const input = calculateRiskSchema.parse(req.body);
    const assessment = riskScoringService.evaluateRisk(input);

    res.json({
      success: true,
      data: assessment
    });
  } catch (error) {
    next(error);
  }
};
