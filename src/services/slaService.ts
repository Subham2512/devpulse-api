export interface SLAResult {
    breached: boolean;
    hoursOpen: number;
    thresholdHours: number;
    severity: 'NORMAL' | 'WARNING' | 'BREACHED';
}

export class SLAService {
    private static readonly DEFAULT_SLA_HOURS = 24;

    /**
     * Evaluates if a pull request has exceeded the SLA review turnaround threshold.
     */
    public evaluateSLA(
        pr: { openedAt: Date; state: string },
        thresholdHours = SLAService.DEFAULT_SLA_HOURS
    ): SLAResult {
        const now = new Date().getTime();
        const opened = new Date(pr.openedAt).getTime();
        const hoursOpen = Number(((now - opened) / (1000 * 60 * 60)).toFixed(1));

        if (pr.state !== 'open') {
            return { breached: false, hoursOpen, thresholdHours, severity: 'NORMAL' };
        }

        if (hoursOpen >= thresholdHours) {
            return { breached: true, hoursOpen, thresholdHours, severity: 'BREACHED' };
        }

        if (hoursOpen >= thresholdHours * 0.75) {
            return { breached: false, hoursOpen, thresholdHours, severity: 'WARNING' };
        }

        return { breached: false, hoursOpen, thresholdHours, severity: 'NORMAL' };
    }
}

export const slaService = new SLAService();