import { Router } from 'express';
import {
  getRepositoryOverview,
  getTurnaroundMetrics,
  calculateRisk
} from '../controllers/metricsController.js';
import { exportMetricsCsv } from '../controllers/exportController.js';

const router = Router();

router.get('/repositories/:repoId/overview', getRepositoryOverview);
router.get('/repositories/:repoId/turnaround', getTurnaroundMetrics);
router.get('/repositories/:repoId/export', exportMetricsCsv);
router.post('/risk-assessment', calculateRisk);

export default router;