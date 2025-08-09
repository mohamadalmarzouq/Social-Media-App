import { z } from 'zod';

export const brandSchema = z.object({
  logoUrl: z.string().optional(),
  colors: z.array(z.string()).max(10, 'Maximum 10 colors allowed'),
  fonts: z.array(z.string()).max(5, 'Maximum 5 fonts allowed'),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
});

export const contestSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(100, 'Title must be less than 100 characters'),
  description: z.string().max(2000, 'Description must be less than 2000 characters').optional(),
  platform: z.enum(['INSTAGRAM', 'TIKTOK'], {
    required_error: 'Please select a platform',
  }),
  packageQuota: z.number().min(1, 'Must need at least 1 design').max(50, 'Maximum 50 designs per contest'),
  expectedSubmissions: z.number().min(5, 'Must expect at least 5 submissions').max(100, 'Maximum 100 expected submissions'),
  brandData: brandSchema,
});

export const commentSchema = z.object({
  message: z.string().min(1, 'Comment cannot be empty').max(1000, 'Comment must be less than 1000 characters'),
});

export type BrandInput = z.infer<typeof brandSchema>;
export type ContestInput = z.infer<typeof contestSchema>;
export type CommentInput = z.infer<typeof commentSchema>;
