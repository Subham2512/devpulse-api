import { Router } from 'express';
import { listRepositories, createRepository } from '../controllers/repoController.js';

const router = Router();

router.get('/', listRepositories);
router.post('/', createRepository);

export default router;
