import { Router } from 'express';
import { handleGitHubWebhook } from '../controllers/webhookController.js';
import { verifyWebhookSignature } from '../middleware/webhookAuth.js';

const router = Router();

router.post('/github', verifyWebhookSignature, handleGitHubWebhook);

export default router;
