import { z } from 'zod';

const passwordSchema = z
  .string()
  .min(1, 'Password is required')
  .refine((val) => val.length > 8, {
    message: 'Password must contain more than 8 characters',
  })
  .refine((val) => /[A-Z]/.test(val), {
    message: 'Password must contain an uppercase letter',
  })
  .refine((val) => /[a-z]/.test(val), {
    message: 'Password must contain a lowercase letter',
  })
  .refine((val) => /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~`]/.test(val), {
    message: 'Password must contain a special character',
  });

export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, 'Name must be at least 2 characters')
      .max(100, 'Name cannot exceed 100 characters'),
    email: z
      .string()
      .trim()
      .toLowerCase()
      .email('Please provide a valid email address'),
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Confirm password is required'),
    companyName: z.string().trim().max(200).optional(),
    phone: z.string().trim().max(30).optional(),
    billingAddress: z
      .object({
        street: z.string().trim().min(1, 'Street is required'),
        city: z.string().trim().min(1, 'City is required'),
        state: z.string().trim().min(1, 'State is required'),
        country: z.string().trim().min(2).max(3),
        postalCode: z.string().trim().min(1, 'Postal code is required'),
      })
      .optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Password and confirm password must match',
    path: ['confirmPassword'],
  });

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email('Invalid email address format'),
  password: z.string().min(1, 'Password is required'),
});

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email('Invalid email address format'),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, 'Reset token is required'),
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Confirm password is required'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Password and confirm password must match',
    path: ['confirmPassword'],
  });

export const createStaffSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, 'Name must be at least 2 characters')
      .max(100, 'Name cannot exceed 100 characters'),
    email: z
      .string()
      .trim()
      .toLowerCase()
      .email('Please provide a valid email address'),
    password: passwordSchema,
    confirmPassword: z.string().optional(),
    phone: z.string().trim().max(30).optional(),
    avatar: z.string().trim().optional(),
  })
  .refine((data) => !data.confirmPassword || data.password === data.confirmPassword, {
    message: 'Password and confirm password must match',
    path: ['confirmPassword'],
  });

export const updateStaffSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100).optional(),
  phone: z.string().trim().max(30).optional(),
  avatar: z.string().trim().optional(),
});

export const updateStaffStatusSchema = z.object({
  status: z.enum(['active', 'inactive', 'suspended']),
});

export const updateCustomerProfileSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100).optional(),
  phone: z.string().trim().max(30).optional(),
  companyName: z.string().trim().max(200).optional(),
  billingAddress: z
    .object({
      street: z.string().trim().min(1, 'Street is required'),
      city: z.string().trim().min(1, 'City is required'),
      state: z.string().trim().min(1, 'State is required'),
      country: z.string().trim().min(2).max(3),
      postalCode: z.string().trim().min(1, 'Postal code is required'),
    })
    .optional(),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: passwordSchema,
    confirmNewPassword: z.string().min(1, 'Confirm new password is required'),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'New password and confirmation must match',
    path: ['confirmNewPassword'],
  });
