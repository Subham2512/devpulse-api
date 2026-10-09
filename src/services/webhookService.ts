import { repoRepository } from '../repositories/repoRepository.js';
import { pullRequestRepository } from '../repositories/pullRequestRepository.js';
import { riskScoringService } from './riskScoringService.js';

export class WebhookService {
  async handleGitHubWebhook(event: {
    action: string;
    repository: { name: string; owner: { login: string }; default_branch?: string };
    pull_request?: {
      number: number;
      title: string;
      user: { login: string };
      state: string;
      additions: number;
      deletions: number;
      changed_files: number;
      created_at: string;
      closed_at?: string | null;
      merged_at?: string | null;
    };
    review?: {
      user: { login: string };
      state: string;
      submitted_at: string;
    };
  }) {
    const repo = await repoRepository.upsert({
      owner: event.repository.owner.login,
      name: event.repository.name,
      defaultBranch: event.repository.default_branch || 'main'
    });

    if (event.pull_request) {
      const prData = event.pull_request;

      const assessment = riskScoringService.evaluateRisk({
        additions: prData.additions,
        deletions: prData.deletions,
        changedFiles: prData.changed_files
      });

      const pr = await pullRequestRepository.upsert({
        repoId: repo.id,
        number: prData.number,
        title: prData.title,
        author: prData.user.login,
        state: prData.merged_at ? 'merged' : prData.state,
        additions: prData.additions,
        deletions: prData.deletions,
        changedFiles: prData.changed_files,
        riskScore: assessment.score,
        riskLevel: assessment.level,
        riskFactors: JSON.stringify(assessment.factors),
        openedAt: new Date(prData.created_at),
        closedAt: prData.closed_at ? new Date(prData.closed_at) : null,
        mergedAt: prData.merged_at ? new Date(prData.merged_at) : null
      });

      if (event.review && event.review.submitted_at) {
        const openedTime = new Date(prData.created_at).getTime();
        const reviewTime = new Date(event.review.submitted_at).getTime();
        const latencySeconds = Math.max(0, Math.floor((reviewTime - openedTime) / 1000));

        await pullRequestRepository.addReview({
          prId: pr.id,
          reviewer: event.review.user.login,
          state: event.review.state,
          submittedAt: new Date(event.review.submitted_at),
          latencySeconds
        });
      }

      return {
        processed: true,
        action: event.action,
        repo: `${repo.owner}/${repo.name}`,
        prNumber: prData.number,
        riskScore: assessment.score
      };
    }

    return {
      processed: true,
      action: event.action,
      repo: `${repo.owner}/${repo.name}`
    };
  }
}

export const webhookService = new WebhookService();
