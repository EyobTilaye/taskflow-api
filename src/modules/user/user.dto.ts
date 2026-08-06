
import { z } from 'zod';



export const registerUserSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name is too long')
    .regex(/^[a-zA-Z\s-]+$/, 'Name can only contain letters, spaces, and hyphens'),
  
  email: z.string()
    .email('Please provide a valid email address')
    .max(255, 'Email is too long'),
  
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password is too long')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});


export const loginUserSchema = z.object({
  email: z.string()
    .email('Please provide a valid email address'),
  password: z.string()
    .min(1, 'Password is required'),
});


export const updateUserSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name is too long')
    .regex(/^[a-zA-Z\s-]+$/, 'Name can only contain letters, spaces, and hyphens')
    .optional(),
  
  email: z.string()
    .email('Please provide a valid email address')
    .max(255, 'Email is too long')
    .optional(),
  
  avatar: z.string()
    .url('Please provide a valid URL')
    .optional()
    .nullable(),
  
  isVerified: z.boolean()
    .optional(),
  
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password is too long')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .optional(),
});

// Query parameters validation
export const userQuerySchema = z.object({
  page: z.coerce.number()
    .int('Page must be an integer')
    .min(1, 'Page must be at least 1')
    .optional()
    .default(1),
  
  limit: z.coerce.number()
    .int('Limit must be an integer')
    .min(1, 'Limit must be at least 1')
    .max(100, 'Limit cannot exceed 100')
    .optional()
    .default(10),
  
  search: z.string()
    .optional()
    .default(''),
  
  isVerified: z.coerce.boolean()
    .optional(),
});

// Email verification validation
export const verifyEmailSchema = z.object({
  email: z.string()
    .email('Please provide a valid email address'),
});

// Type inference - automatically generates TypeScript types
export type RegisterUserDto = z.infer<typeof registerUserSchema>;
export type LoginUserDto = z.infer<typeof loginUserSchema>;
export type UpdateUserDto = z.infer<typeof updateUserSchema>;
export type UserQueryDto = z.infer<typeof userQuerySchema>;
export type VerifyEmailDto = z.infer<typeof verifyEmailSchema>;