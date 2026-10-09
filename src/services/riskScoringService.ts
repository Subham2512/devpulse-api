import { PRAnalysisInput, PRRiskAssessment, RiskFactor, RiskLevel } from '../types/index.js';

const SENSITIVE_PATTERNS = [
  { pattern: /(auth|jwt|session|token|permission|oauth)/i, name: 'Authentication/Security', impact: 25 },
  { pattern: /(migration|schema\.prisma|db\/migrate)/i, name: 'Database Schema/Migration', impact: 20 },
  { pattern: /(\.env|secret|credentials|docker-compose|\.github\/workflows)/i, name: 'Infra/Configuration', impact: 15 },
  { pattern: /(payment|stripe|billing|invoice|checkout)/i, name: 'Billing/Payments', impact: 30 }
];

export class RiskScoringService {
  /**
   * Evaluates the risk score of a pull request from 0 to 100.
   */
  public evaluateRisk(input: PRAnalysisInput): PRRiskAssessment {
    const factors: RiskFactor[] = [];
    let score = 0;

    const totalChurn = input.additions + input.deletions;

    // 1. Churn Factor
    if (totalChurn > 1000) {
      factors.push({
        code: 'EXTREME_CHURN',
        severity: 'CRITICAL',
        description: `Massive code churn (${totalChurn} lines changed) increases regression probability`,
        impact: 35
      });
      score += 35;
    } else if (totalChurn > 400) {
      factors.push({
        code: 'HIGH_CHURN',
        severity: 'HIGH',
        description: `High code churn (${totalChurn} lines changed)`,
        impact: 20
      });
      score += 20;
    } else if (totalChurn > 150) {
      factors.push({
        code: 'MODERATE_CHURN',
        severity: 'MEDIUM',
        description: `Moderate code churn (${totalChurn} lines)`,
        impact: 10
      });
      score += 10;
    }

    // 2. File Count Factor
    if (input.changedFiles > 25) {
      factors.push({
        code: 'HIGH_FILE_SPREAD',
        severity: 'HIGH',
        description: `Changes spread across ${input.changedFiles} files increase cognitive review load`,
        impact: 20
      });
      score += 20;
    } else if (input.changedFiles > 10) {
      factors.push({
        code: 'MODERATE_FILE_SPREAD',
        severity: 'MEDIUM',
        description: `Changes spread across ${input.changedFiles} files`,
        impact: 10
      });
      score += 10;
    }

    // 3. Sensitive Path Analysis
    if (input.files && input.files.length > 0) {
      for (const sensitive of SENSITIVE_PATTERNS) {
        const matched = input.files.find((f) => sensitive.pattern.test(f.filename));
        if (matched) {
          factors.push({
            code: 'SENSITIVE_MODULE_MODIFIED',
            severity: 'HIGH',
            description: `Modifies sensitive module: ${sensitive.name} (${matched.filename})`,
            impact: sensitive.impact
          });
          score += sensitive.impact;
        }
      }
    }

    // 4. Test Coverage Ratio
    const hasTests =
      input.hasTests ??
      (input.files ? input.files.some((f) => /(test|spec|\.test\.|\.spec\.)/i.test(f.filename)) : false);

    if (!hasTests && totalChurn > 100) {
      factors.push({
        code: 'NO_TESTS_DETECTED',
        severity: 'HIGH',
        description: 'Significant code modifications without accompanying test files',
        impact: 25
      });
      score += 25;
    } else if (hasTests) {
      score = Math.max(0, score - 10);
    }

    const finalScore = Math.min(100, Math.max(0, score));

    let level: RiskLevel = 'LOW';
    if (finalScore >= 75) {
      level = 'CRITICAL';
    } else if (finalScore >= 50) {
      level = 'HIGH';
    } else if (finalScore >= 25) {
      level = 'MEDIUM';
    }

    return {
      score: finalScore,
      level,
      factors
    };
  }
}

export const riskScoringService = new RiskScoringService();
