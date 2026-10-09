import { Router } from 'express';
import {
  getRepositoryOverview,
  getTurnaroundMetrics,
  calculateRisk
} from '../controllers/metricsController.js';

const router = Router();

router.get('/repositories/:repoId/overview', getRepositoryOverview);
router.get('/repositories/:repoId/turnaround', getTurnaroundMetrics);
router.post('/risk-assessment', calculateRisk);

export default router;
