import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { sendValidationError } from '../utils/response';

export const validate = (schema: AnyZodObject, target: 'body' | 'query' | 'params' = 'body') => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Debug: Log what's being validated
      console.log('Validating:', target, req[target]);
      
      // Parse the data
      const validatedData = await schema.parseAsync(req[target]);
      
      // Replace with validated data (sanitized)
      req[target] = validatedData;
      
      console.log('Validation passed');
      next();
    } catch (error: unknown) { 
      console.log('Validation failed:', error);
      console.log('\nhere\n');
      if (error instanceof ZodError) {
        // Format errors properly
        const formattedErrors = error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
          code: issue.code,
        }));
        
        console.log('Formatted errors:', formattedErrors);
        return sendValidationError(res, formattedErrors);
      }
      
      next(error);
    }
  };
};