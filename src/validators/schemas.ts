import { z } from 'zod';

export const createRepositorySchema = z.object({
  owner: z.string().min(1, 'Owner is required').max(100),
  name: z.string().min(1, 'Name is required').max(100),
  defaultBranch: z.string().default('main'),
  webhookSecret: z.string().optional()
});

export const githubWebhookSchema = z.object({
  action: z.string(),
  repository: z.object({
    id: z.number().optional(),
    name: z.string(),
    owner: z.object({
      login: z.string()
    }),
    default_branch: z.string().optional()
  }),
  pull_request: z
    .object({
      id: z.number().optional(),
      number: z.number(),
      title: z.string(),
      user: z.object({
        login: z.string()
      }),
      state: z.string(),
      additions: z.number().default(0),
      deletions: z.number().default(0),
      changed_files: z.number().default(0),
      created_at: z.string(),
      closed_at: z.string().nullable().optional(),
      merged_at: z.string().nullable().optional()
    })
    .optional(),
  review: z
    .object({
      id: z.number().optional(),
      user: z.object({
        login: z.string()
      }),
      state: z.string(),
      submitted_at: z.string()
    })
    .optional()
});

export const turnaroundQuerySchema = z.object({
  days: z
    .string()
    .optional()
    .default('30')
    .transform((val) => parseInt(val, 10))
    .refine((val) => val > 0 && val <= 365, {
      message: 'Days must be between 1 and 365'
    })
});

export const calculateRiskSchema = z.object({
  additions: z.number().int().min(0),
  deletions: z.number().int().min(0),
  changedFiles: z.number().int().min(0),
  files: z
    .array(
      z.object({
        filename: z.string(),
        additions: z.number().int().default(0),
        deletions: z.number().int().default(0)
      })
    )
    .optional(),
  commitsCount: z.number().int().min(1).optional().default(1),
  hasTests: z.boolean().optional()
});
