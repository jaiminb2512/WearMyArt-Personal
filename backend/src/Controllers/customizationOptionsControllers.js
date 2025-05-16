import CustomizationOptions from "../models/customizationOptionsModel.js";
import apiResponse from "../utils/apiResponse.js";
import {
  addCustomizationOptionsValidator,
  deleteCustomizationOptionsValidator,
  getCustomizationOptionsValidator,
} from "../validators/customizationOptionsValidator.js";

const addCustomizationOptions = async (req, res) => {
  try {
    const validation = addCustomizationOptionsValidator.safeParse(req.body);

    if (!validation.success) {
      const firstError = validation.error.errors[0];
      return apiResponse(
        res,
        false,
        null,
        firstError.message,
        firstError.statusCode || 400
      );
    }

    const { fontOptions, textStyles } = req.body;

    let customizationOptions = await CustomizationOptions.findOne({});

    if (!customizationOptions) {
      customizationOptions = new CustomizationOptions({
        fontOptions: new Map(Object.entries(fontOptions)),
        textStyles: new Map(Object.entries(textStyles)),
      });

      await customizationOptions.save();
      return apiResponse(
        res,
        true,
        customizationOptions,
        "Customization options created successfully",
        201
      );
    }

    if (fontOptions) {
      for (const [key, value] of Object.entries(fontOptions)) {
        customizationOptions.fontOptions.set(key, value);
      }
    }

    if (textStyles) {
      for (const [key, value] of Object.entries(textStyles)) {
        customizationOptions.textStyles.set(key, value);
      }
    }

    await customizationOptions.save();

    return apiResponse(
      res,
      true,
      customizationOptions,
      "Customization options updated successfully",
      201
    );
  } catch (error) {
    return apiResponse(res, false, null, error.message, 500);
  }
};

const deleteCustomizationOptions = async (req, res) => {
  try {
    const validation = deleteCustomizationOptionsValidator.safeParse(req.body);

    if (!validation.success) {
      const firstError = validation.error.errors[0];
      return apiResponse(
        res,
        false,
        null,
        firstError.message,
        firstError.statusCode || 400
      );
    }

    const { fontOptions, textStyles } = req.body;

    let customizationOptions = await CustomizationOptions.findOne({});

    if (!customizationOptions) {
      return apiResponse(
        res,
        false,
        null,
        "Customization options not found",
        204
      );
    }

    if (fontOptions) {
      for (const font of fontOptions) {
        customizationOptions.fontOptions.delete(font);
      }
    }

    if (textStyles) {
      for (const style of textStyles) {
        customizationOptions.textStyles.delete(style);
      }
    }

    await customizationOptions.save();

    return apiResponse(
      res,
      true,
      customizationOptions,
      "Customization options deleted successfully",
      200
    );
  } catch (error) {
    return apiResponse(res, false, null, error.message, 500);
  }
};

const getCustomizationOptions = async (req, res) => {
  try {
    const validation = getCustomizationOptionsValidator.safeParse(req.query);

    if (!validation.success) {
      const firstError = validation.error.errors[0];
      return apiResponse(
        res,
        false,
        null,
        firstError.message,
        firstError.statusCode || 400
      );
    }

    let customizationOptions = await CustomizationOptions.findOne({});

    if (!customizationOptions) {
      return apiResponse(
        res,
        false,
        null,
        "No customization options found",
        404
      );
    }

    return apiResponse(
      res,
      true,
      customizationOptions,
      "Customization options fetched successfully",
      200
    );
  } catch (error) {
    return apiResponse(res, false, null, error.message, 500);
  }
};

export {
  addCustomizationOptions, // done
  deleteCustomizationOptions, // done 
  getCustomizationOptions, // done
};
