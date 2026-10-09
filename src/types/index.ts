export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface RiskFactor {
  code: string;
  severity: RiskLevel;
  description: string;
  impact: number;
}

export interface PRRiskAssessment {
  score: number;
  level: RiskLevel;
  factors: RiskFactor[];
}

export interface FileChange {
  filename: string;
  additions: number;
  deletions: number;
}

export interface PRAnalysisInput {
  additions: number;
  deletions: number;
  changedFiles: number;
  files?: FileChange[];
  commitsCount?: number;
  hasTests?: boolean;
}

export interface TurnaroundMetrics {
  totalPRs: number;
  openPRs: number;
  mergedPRs: number;
  closedPRs: number;
  avgTurnaroundHours: number;
  p95TurnaroundHours: number;
  medianTurnaroundHours: number;
  reviewBottlenecks: {
    reviewer: string;
    pendingCount: number;
    avgLatencyHours: number;
  }[];
}

export interface RepositoryOverview {
  id: string;
  owner: string;
  name: string;
  defaultBranch: string;
  totalPRs: number;
  highRiskPRs: number;
  avgTurnaroundHours: number;
  healthScore: number;
}
