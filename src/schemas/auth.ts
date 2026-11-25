import { z } from 'zod';

export const loginResponseSchema = z.object({ token: z.string().min(1) });

export const apiErrorSchema = z.object({
  status: z.number(),
  code: z.string(),
  message: z.string(),
  path: z.string(),
  requestId: z.string().min(1),
  fields: z.record(z.string(), z.string()).optional(),
});
