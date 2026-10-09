import { prisma } from '../lib/prisma.js';

export class PullRequestRepository {
  async findByRepoAndNumber(repoId: string, number: number) {
    return prisma.pullRequest.findUnique({
      where: {
        repoId_number: { repoId, number }
      },
      include: {
        reviews: true
      }
    });
  }

  async upsert(data: {
    repoId: string;
    number: number;
    title: string;
    author: string;
    state: string;
    additions: number;
    deletions: number;
    changedFiles: number;
    riskScore: number;
    riskLevel: string;
    riskFactors: string;
    openedAt: Date;
    closedAt?: Date | null;
    mergedAt?: Date | null;
  }) {
    return prisma.pullRequest.upsert({
      where: {
        repoId_number: { repoId: data.repoId, number: data.number }
      },
      update: {
        title: data.title,
        state: data.state,
        additions: data.additions,
        deletions: data.deletions,
        changedFiles: data.changedFiles,
        riskScore: data.riskScore,
        riskLevel: data.riskLevel,
        riskFactors: data.riskFactors,
        closedAt: data.closedAt,
        mergedAt: data.mergedAt
      },
      create: {
        repoId: data.repoId,
        number: data.number,
        title: data.title,
        author: data.author,
        state: data.state,
        additions: data.additions,
        deletions: data.deletions,
        changedFiles: data.changedFiles,
        riskScore: data.riskScore,
        riskLevel: data.riskLevel,
        riskFactors: data.riskFactors,
        openedAt: data.openedAt,
        closedAt: data.closedAt,
        mergedAt: data.mergedAt
      }
    });
  }

  async addReview(data: {
    prId: string;
    reviewer: string;
    state: string;
    submittedAt: Date;
    latencySeconds: number;
  }) {
    return prisma.review.create({
      data: {
        prId: data.prId,
        reviewer: data.reviewer,
        state: data.state,
        submittedAt: data.submittedAt,
        latencySeconds: data.latencySeconds
      }
    });
  }

  async getRecentPRsForRepo(repoId: string, limit = 50) {
    return prisma.pullRequest.findMany({
      where: { repoId },
      orderBy: { openedAt: 'desc' },
      take: limit,
      include: { reviews: true }
    });
  }

  async countByRepoAndLevel(repoId: string, riskLevel: string) {
    return prisma.pullRequest.count({
      where: { repoId, riskLevel }
    });
  }
}

export const pullRequestRepository = new PullRequestRepository();
