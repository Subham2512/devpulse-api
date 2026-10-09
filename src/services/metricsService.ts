import { pullRequestRepository } from '../repositories/pullRequestRepository.js';
import { repoRepository } from '../repositories/repoRepository.js';
import { AppError } from '../middleware/errorHandler.js';
import { RepositoryOverview, TurnaroundMetrics } from '../types/index.js';

export class MetricsService {
  async getTurnaroundMetrics(repoId: string, days = 30): Promise<TurnaroundMetrics> {
    const repo = await repoRepository.findById(repoId);
    if (!repo) {
      throw new AppError(`Repository with id ${repoId} not found`, 404);
    }

    const prs = await pullRequestRepository.getRecentPRsForRepo(repoId, 100);

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const filteredPRs = prs.filter((pr) => new Date(pr.openedAt) >= cutoffDate);

    const openPRs = filteredPRs.filter((p) => p.state === 'open').length;
    const mergedPRs = filteredPRs.filter((p) => p.state === 'merged').length;
    const closedPRs = filteredPRs.filter((p) => p.state === 'closed').length;

    const latenciesHours: number[] = [];
    const reviewerStats: Record<string, { count: number; totalLatencySeconds: number }> = {};

    for (const pr of filteredPRs) {
      if (pr.reviews && pr.reviews.length > 0) {
        const sortedReviews = [...pr.reviews].sort(
          (a, b) => new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime()
        );

        const firstReview = sortedReviews[0];
        const hoursToFirstReview = firstReview.latencySeconds / 3600;
        latenciesHours.push(hoursToFirstReview);

        for (const review of pr.reviews) {
          if (!reviewerStats[review.reviewer]) {
            reviewerStats[review.reviewer] = { count: 0, totalLatencySeconds: 0 };
          }
          reviewerStats[review.reviewer].count += 1;
          reviewerStats[review.reviewer].totalLatencySeconds += review.latencySeconds;
        }
      }
    }

    latenciesHours.sort((a, b) => a - b);

    const avgTurnaroundHours =
      latenciesHours.length > 0
        ? Number(
            (latenciesHours.reduce((sum, val) => sum + val, 0) / latenciesHours.length).toFixed(2)
          )
        : 0;

    const p95TurnaroundHours =
      latenciesHours.length > 0
        ? Number(latenciesHours[Math.floor(latenciesHours.length * 0.95)].toFixed(2))
        : 0;

    const medianTurnaroundHours =
      latenciesHours.length > 0
        ? Number(latenciesHours[Math.floor(latenciesHours.length * 0.5)].toFixed(2))
        : 0;

    const reviewBottlenecks = Object.entries(reviewerStats).map(([reviewer, stats]) => ({
      reviewer,
      pendingCount: stats.count,
      avgLatencyHours: Number((stats.totalLatencySeconds / stats.count / 3600).toFixed(2))
    }));

    return {
      totalPRs: filteredPRs.length,
      openPRs,
      mergedPRs,
      closedPRs,
      avgTurnaroundHours,
      p95TurnaroundHours,
      medianTurnaroundHours,
      reviewBottlenecks
    };
  }

  async getRepositoryOverview(repoId: string): Promise<RepositoryOverview> {
    const repo = await repoRepository.findById(repoId);
    if (!repo) {
      throw new AppError(`Repository with id ${repoId} not found`, 404);
    }

    const prs = await pullRequestRepository.getRecentPRsForRepo(repoId, 100);
    const highRiskPRs = prs.filter((p) => p.riskLevel === 'HIGH' || p.riskLevel === 'CRITICAL').length;

    const metrics = await this.getTurnaroundMetrics(repoId, 30);

    let healthScore = 100;
    if (metrics.avgTurnaroundHours > 48) {
      healthScore -= 30;
    } else if (metrics.avgTurnaroundHours > 24) {
      healthScore -= 15;
    }

    const highRiskRatio = prs.length > 0 ? highRiskPRs / prs.length : 0;
    healthScore -= Math.round(highRiskRatio * 40);

    return {
      id: repo.id,
      owner: repo.owner,
      name: repo.name,
      defaultBranch: repo.defaultBranch,
      totalPRs: prs.length,
      highRiskPRs,
      avgTurnaroundHours: metrics.avgTurnaroundHours,
      healthScore: Math.max(0, healthScore)
    };
  }
}

export const metricsService = new MetricsService();
