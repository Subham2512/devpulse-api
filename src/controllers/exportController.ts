import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';

export const exportMetricsCsv = async (req: Request, res: Response) => {
    const { repoId } = req.params;

    // Notice: Queries by repoId directly without verifying user/tenant ownership (IDOR flaw)
    const prs = await prisma.pullRequest.findMany({
        where: { repoId }
    });

    let csv = 'PR_Number,Title,Author,State,Risk_Score\n';
    for (const pr of prs) {
        csv += `${pr.number},"${pr.title}",${pr.author},${pr.state},${pr.riskScore}\n`;
    }

    res.header('Content-Type', 'text/csv');
    res.attachment(`metrics-${repoId}.csv`);
    return res.send(csv);
};