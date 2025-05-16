import { z } from "zod";

const productFieldsSchema = z.object({
  imgURL: z.array(z.string()).optional(),
  sizeStock: z.record(z.string(), z.number()).optional(),
  price: z.number().min(0, "Price must be greater than or equal to 0"),
  discountedPrice: z
    .number()
    .min(0, "Discounted price must be greater than or equal to 0")
    .optional(),
  sleeve: z.enum(["Full Sleeve", "Half Sleeve", "Sleeveless"], {
    errorMap: () => ({
      message: "Sleeve must be Full Sleeve, Half Sleeve, or Sleeveless",
    }),
  }),
  color: z.string().min(1, "Color is required"),
  customizeOption: z.enum(["Photo", "Text", "Both"], {
    errorMap: () => ({
      message: "Customize option must be Photo, Text, or Both",
    }),
  }),
  description: z.string().min(1, "Description is required"),
  maxEditingCost: z
    .number()
    .min(0, "Max editing cost must be greater than or equal to 0"),
  otherDetails: z.record(z.string(), z.number()).optional(),
  isDiscontinued: z.boolean().optional(),
});

export const addProductValidator = productFieldsSchema;

export const updateProductValidator = productFieldsSchema.partial();

export const getAllProductsFilterValidator = z.object({
  size: z.array(z.string()).optional(),
  sleeve: z.array(z.string()).optional(),
  customizeOption: z.array(z.string()).optional(),
  color: z.array(z.string()).optional(),
  price: z.array(z.number()).length(2).optional(),
  availability: z.array(z.string()).optional(),
  sortOrder: z.enum(["lowToHigh", "highToLow"]).optional(),
});

export const getAllActiveProductsFilterValidator = z.object({
  size: z.array(z.string()).optional(),
  sleeve: z.array(z.string()).optional(),
  customizeOption: z.array(z.string()).optional(),
  color: z.array(z.string()).optional(),
  price: z.array(z.number()).length(2).optional(),
  sortOrder: z.enum(["lowToHigh", "highToLow"]).optional(),
});

export const productIdsValidator = z.object({
  products: z.array(z.string().min(1, "Product ID is required")),
});
