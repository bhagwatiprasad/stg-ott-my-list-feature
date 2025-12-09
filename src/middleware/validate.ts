import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import type { ApiResponse } from '../types';
import { VALIDATION, ERRORS } from '../constants';

// Validation schemas
export const addToListSchema = z.object({
  contentId: z
    .string()
    .min(1, VALIDATION.CONTENT_ID_REQUIRED)
    .max(50, VALIDATION.CONTENT_ID_TOO_LONG),
  contentType: z.enum(['movie', 'tvshow']),
});

export const listItemsQuerySchema = z.object({
  type: z.enum(['offset', 'cursor']).default('offset'),
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1))
    .refine((val) => val >= 1, VALIDATION.PAGE_MIN),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 10))
    .refine((val) => val >= 1 && val <= 100, VALIDATION.LIMIT_RANGE),
  cursor: z.string().optional(),
});

export const contentIdParamSchema = z.object({
  contentId: z
    .string()
    .min(1, VALIDATION.CONTENT_ID_REQUIRED)
    .max(50, VALIDATION.CONTENT_ID_TOO_LONG),
});

// Types for validated data
export type AddToListInput = z.infer<typeof addToListSchema>;
export type ListItemsQueryInput = z.infer<typeof listItemsQuerySchema>;
export type ContentIdParamInput = z.infer<typeof contentIdParamSchema>;

// Generic validation middleware factory
export const validate = <T>(schema: z.ZodType<T>, source: 'body' | 'query' | 'params' = 'body') => {
  return (req: Request, res: Response<ApiResponse<null>>, next: NextFunction): void => {
    try {
      const data = source === 'body' ? req.body : source === 'query' ? req.query : req.params;
      const validated = schema.parse(data);
      
      // Replace with validated data
      if (source === 'body') {
        req.body = validated;
      } else if (source === 'query') {
        req.validatedQuery = validated as ListItemsQueryInput;
      } else {
        req.validatedParams = validated as ContentIdParamInput;
      }
      
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const details = error.issues.map((e) => `${e.path.join('.')}: ${e.message}`);
        res.status(400).json({
          success: false,
          error: ERRORS.VALIDATION_ERROR,
          details,
        });
        return;
      }
      next(error);
    }
  };
};

// Extend Express Request for validated data
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      validatedQuery?: ListItemsQueryInput;
      validatedParams?: ContentIdParamInput;
    }
  }
}

export default validate;

