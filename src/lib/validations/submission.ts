import { z } from 'zod';

export const submissionSchema = z.object({
  contestId: z.string().min(1, 'Contest ID is required'),
  comment: z.string().max(1000, 'Comment must be less than 1000 characters').optional(),
});

export type SubmissionInput = z.infer<typeof submissionSchema>;
