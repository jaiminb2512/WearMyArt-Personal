import { z } from "zod";

const registerValidator = z.object({
  fullName: z
    .string({ required_error: "Full name is required", statusCode: 400 })
    .min(3, {
      message: "Full name must be at least 3 characters long",
      statusCode: 400,
    }),

  email: z
    .string({ required_error: "Email is required", statusCode: 400 })
    .email({ message: "Invalid email address", statusCode: 400 }),

  password: z
    .string({ required_error: "Password is required", statusCode: 400 })
    .min(8, {
      message: "Password must be at least 8 characters long",
      statusCode: 400,
    })
    .max(16, {
      message: "Password must be no more than 16 characters",
      statusCode: 400,
    })
    .refine((val) => /[A-Z]/.test(val), {
      message: "Password must contain at least one uppercase letter",
      statusCode: 400,
    })
    .refine((val) => /[!@#$%^&*(),.?":{}|<>]/.test(val), {
      message: "Password must contain at least one special character",
      statusCode: 400,
    })
    .refine((val) => /[0-9]/.test(val), {
      message: "Password must contain at least one numerical character",
      statusCode: 400,
    }),
});

const loginValidator = z.object({
  email: z
    .string({ required_error: "Email is required", statusCode: 400 })
    .email({ message: "Invalid email format", statusCode: 400 }),

  OTP: z
    .string()
    .optional()
    .refine((val) => val === undefined || String(val).length > 0, {
      message: "OTP cannot be empty",
      statusCode: 400,
    }),

  password: z
    .string()
    .optional()
    .refine((val) => val === undefined || val.length >= 6, {
      message: "Password must be at least 6 characters",
      statusCode: 400,
    }),
});

const sendingMailForLoginValidator = z.object({
  email: z
    .string({ required_error: "Email is required", statusCode: 400 })
    .email({ message: "Invalid email format", statusCode: 400 }),
});

const sendingMailForForgotPasswordValidator = z.object({
  email: z
    .string({ required_error: "Email is required", statusCode: 400 })
    .email({ message: "Invalid email format", statusCode: 400 }),
});

const otpVerifyForForgotPasswordValidator = z.object({
  email: z
    .string({ required_error: "Email is required", statusCode: 400 })
    .email({ message: "Invalid email format", statusCode: 400 }),
  OTP: z
    .string({ required_error: "OTP is required", statusCode: 400 })
    .refine((val) => String(val).length === 6, {
      message: "OTP must be 6 digits",
      statusCode: 400,
    }),
});

const forgotPasswordValidator = z.object({
  email: z
    .string({ required_error: "Email is required", statusCode: 400 })
    .email({ message: "Invalid email format", statusCode: 400 }),
  OTP: z
    .number({ required_error: "OTP is required", statusCode: 400 })
    .refine((val) => String(val).length === 6, {
      message: "OTP must be 6 digits",
      statusCode: 400,
    }),
  password: z
    .string({ required_error: "Password is required", statusCode: 400 })
    .min(8, {
      message: "Password must be at least 8 characters long",
      statusCode: 400,
    })
    .max(16, {
      message: "Password must be no more than 16 characters",
      statusCode: 400,
    })
    .refine((val) => /[A-Z]/.test(val), {
      message: "Password must contain at least one uppercase letter",
      statusCode: 400,
    })
    .refine((val) => /[!@#$%^&*(),.?":{}|<>]/.test(val), {
      message: "Password must contain at least one special character",
      statusCode: 400,
    })
    .refine((val) => /[0-9]/.test(val), {
      message: "Password must contain at least one numerical character",
      statusCode: 400,
    }),
});

const updateUserValidator = z.object({
  fullName: z
    .string()
    .min(3, {
      message: "Full name must be at least 3 characters long",
      statusCode: 400,
    })
    .optional(),
  email: z
    .string()
    .email({ message: "Invalid email format", statusCode: 400 })
    .optional(),
}).refine((data) => data.fullName || data.email, {
  message: "At least one field (fullName or email) must be provided",
  statusCode: 400,
});

const sendingMailForActivateValidator = z.object({
  email: z
    .string({ required_error: "Email is required", statusCode: 400 })
    .email({ message: "Invalid email format", statusCode: 400 }),
});

const verifyActivationOTPValidator = z.object({
  email: z
    .string({ required_error: "Email is required", statusCode: 400 })
    .email({ message: "Invalid email format", statusCode: 400 }),
  OTP: z
    .string({ required_error: "OTP is required", statusCode: 400 })
    .refine((val) => String(val).length === 6, {
      message: "OTP must be 6 digits",
      statusCode: 400,
    }),
});

const blockUsersValidator = z.object({
  userIds: z
    .array(z.string())
    .min(1, { message: "At least one user ID is required", statusCode: 400 }),
});

const unblockUsersValidator = z.object({
  userIds: z
    .array(z.string())
    .min(1, { message: "At least one user ID is required", statusCode: 400 }),
});

export {
  registerValidator,
  loginValidator,
  sendingMailForLoginValidator,
  sendingMailForForgotPasswordValidator,
  otpVerifyForForgotPasswordValidator,
  forgotPasswordValidator,
  updateUserValidator,
  sendingMailForActivateValidator,
  verifyActivationOTPValidator,
  blockUsersValidator,
  unblockUsersValidator,
};