import { describe, it, expect } from 'vitest';
import { riskScoringService } from '../src/services/riskScoringService.js';

describe('RiskScoringService', () => {
  it('should assess a low risk score for small pull request with tests', () => {
    const result = riskScoringService.evaluateRisk({
      additions: 25,
      deletions: 10,
      changedFiles: 2,
      files: [
        { filename: 'src/utils/math.ts', additions: 15, deletions: 5 },
        { filename: 'tests/math.test.ts', additions: 10, deletions: 5 }
      ],
      hasTests: true
    });

    expect(result.score).toBe(0);
    expect(result.level).toBe('LOW');
    expect(result.factors).toHaveLength(0);
  });

  it('should flag high churn when total additions and deletions exceed 400 lines', () => {
    const result = riskScoringService.evaluateRisk({
      additions: 300,
      deletions: 150,
      changedFiles: 8,
      hasTests: true
    });

    expect(result.score).toBeGreaterThanOrEqual(10);
    expect(result.factors.some((f) => f.code === 'HIGH_CHURN')).toBe(true);
  });

  it('should flag sensitive security files when auth module is modified', () => {
    const result = riskScoringService.evaluateRisk({
      additions: 50,
      deletions: 20,
      changedFiles: 3,
      files: [
        { filename: 'src/auth/jwtProvider.ts', additions: 40, deletions: 10 },
        { filename: 'src/config/auth.ts', additions: 10, deletions: 10 }
      ],
      hasTests: true
    });

    expect(result.factors.some((f) => f.code === 'SENSITIVE_MODULE_MODIFIED')).toBe(true);
    expect(result.score).toBeGreaterThanOrEqual(15);
  });

  it('should apply penalty when significant code is changed without tests', () => {
    const result = riskScoringService.evaluateRisk({
      additions: 120,
      deletions: 40,
      changedFiles: 4,
      files: [{ filename: 'src/services/billing.ts', additions: 120, deletions: 40 }],
      hasTests: false
    });

    expect(result.factors.some((f) => f.code === 'NO_TESTS_DETECTED')).toBe(true);
    expect(result.level).toBe('HIGH');
  });
});
