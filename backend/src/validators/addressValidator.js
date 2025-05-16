import { z } from "zod";

// Common address fields schema
const addressFieldsSchema = z.object({
  phoneNumber: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .max(15, "Phone number must not exceed 15 digits"),
  addressLine1: z
    .string()
    .min(1, "Address line 1 is required")
    .max(100, "Address line 1 must not exceed 100 characters"),
  addressLine2: z
    .string()
    .max(100, "Address line 2 must not exceed 100 characters")
    .optional(),
  landmark: z
    .string()
    .max(50, "Landmark must not exceed 50 characters")
    .optional(),
  city: z
    .string()
    .min(1, "City is required")
    .max(50, "City must not exceed 50 characters"),
  state: z
    .string()
    .min(1, "State is required")
    .max(50, "State must not exceed 50 characters"),
  postalCode: z
    .string()
    .min(1, "Postal code is required")
    .max(10, "Postal code must not exceed 10 characters"),
  country: z
    .string()
    .min(1, "Country is required")
    .max(50, "Country must not exceed 50 characters"),
  addressType: z.enum(["Home", "Work", "Other"], {
    errorMap: () => ({ message: "Address type must be Home, Work, or Other" }),
  }),
  label: z
    .string()
    .min(1, "Label is required")
    .max(30, "Label must not exceed 30 characters")
    .optional(),
});

// Add address validator
export const addAddressValidator = addressFieldsSchema;

// Update address validator
export const updateAddressValidator = addressFieldsSchema;

// Change default address validator
export const changeDefaultAddressValidator = z.object({
  addressId: z.string().min(1, "Address ID is required"),
  label: z
    .string()
    .min(1, "Label is required")
    .max(30, "Label must not exceed 30 characters"),
});
