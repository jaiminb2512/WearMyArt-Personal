import { Schema, model } from "mongoose";

const CustomizationOptionsSchema = new Schema({
  fontOptions: {
    type: Map,
    of: Number,
    require: true,
  },
  textStyles: {
    type: Map,
    of: Number,
    require: true,
    // Bold, Italic, Underline, Regular
  },
});

const CustomizationOptions = model(
  "CustomizationOptions",
  CustomizationOptionsSchema
);

export default CustomizationOptions;
