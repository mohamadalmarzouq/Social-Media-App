import { z } from 'zod';

export const submissionSchema = z.object({
  contestId: z.string().min(1, 'Contest ID is required'),
  comment: z.string().max(1000, 'Comment must be less than 1000 characters').optional(),
  files: z.array(z.object({
    id: z.string(),
    url: z.string(),
    filename: z.string(),
    type: z.enum(['IMAGE', 'VIDEO']),
  })).optional(), // Optional initially for temporary submission
});

export const commentSchema = z.object({
  message: z.string().min(1, 'Comment cannot be empty').max(1000, 'Comment must be less than 1000 characters'),
});

export type SubmissionInput = z.infer<typeof submissionSchema>;
export type CommentInput = z.infer<typeof commentSchema>;
