import { z } from "zod";


const fontOptionsSchema = z.record(z.number()).refine(
  (val) => Object.keys(val).length > 0,
  {
    message: "At least one font option is required",
    statusCode: 422, 
  }
);


const textStylesSchema = z.record(z.number()).refine(
  (val) => Object.keys(val).length > 0,
  {
    message: "At least one text style is required",
    statusCode: 422, 
  }
);


const addCustomizationOptionsValidator = z.object({
  fontOptions: fontOptionsSchema,
  textStyles: textStylesSchema,
}).refine(
  (data) => {
    
    return !Object.values(data.fontOptions).some(value => value < 0);
  },
  {
    message: "Font option values cannot be negative",
    statusCode: 422,
  }
).refine(
  (data) => {
    
    return !Object.values(data.textStyles).some(value => value < 0);
  },
  {
    message: "Text style values cannot be negative",
    statusCode: 422,
  }
);


const deleteCustomizationOptionsValidator = z.object({
  fontOptions: z.array(z.string()).optional(),
  textStyles: z.array(z.string()).optional(),
}).refine(
  (data) => data.fontOptions?.length > 0 || data.textStyles?.length > 0,
  {
    message: "At least one option to delete must be provided",
    statusCode: 422, 
  }
).refine(
  (data) => {
    
    const hasEmptyFonts = data.fontOptions?.some(font => !font.trim());
    const hasEmptyStyles = data.textStyles?.some(style => !style.trim());
    return !hasEmptyFonts && !hasEmptyStyles;
  },
  {
    message: "Option names cannot be empty",
    statusCode: 422,
  }
);


const getCustomizationOptionsValidator = z.object({
  
}).strict({
  message: "Invalid query parameters",
  statusCode: 400, 
});

export {
  addCustomizationOptionsValidator,
  deleteCustomizationOptionsValidator,
  getCustomizationOptionsValidator,
}; 