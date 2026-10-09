import { Request, Response, NextFunction } from 'express';
import { repoRepository } from '../repositories/repoRepository.js';
import { createRepositorySchema } from '../validators/schemas.js';

export const listRepositories = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const repos = await repoRepository.list();
    res.json({
      success: true,
      data: repos
    });
  } catch (error) {
    next(error);
  }
};

export const createRepository = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const validated = createRepositorySchema.parse(req.body);
    const existing = await repoRepository.findByOwnerAndName(validated.owner, validated.name);

    if (existing) {
      res.status(409).json({
        success: false,
        error: `Repository ${validated.owner}/${validated.name} already exists`
      });
      return;
    }

    const created = await repoRepository.create(validated);
    res.status(201).json({
      success: true,
      data: created
    });
  } catch (error) {
    next(error);
  }
};
