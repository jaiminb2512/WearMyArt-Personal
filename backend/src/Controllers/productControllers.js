import mongoose from "mongoose";
import Product from "../models/productModel.js";
import apiResponse from "../utils/apiResponse.js";
import deleteFiles from "../utils/deleteFiles.js";
import path from "path";
import {
  addProductValidator,
  updateProductValidator,
  getAllProductsFilterValidator,
  getAllActiveProductsFilterValidator,
  productIdsValidator,
} from "../validators/productValidator.js";

const addProduct = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return apiResponse(res, false, null, "No images uploaded", 400);
    }

    const imgURL = req.files.map(
      (file) => `/uploads/${path.basename(file.path)}`
    );

    console.log(imgURL)

    const parsedBody = {
      ...req.body,
      imgURL,
      price: Number(req.body.price),
      discountedPrice: req.body.discountedPrice
        ? Number(req.body.discountedPrice)
        : undefined,
      maxEditingCost: Number(req.body.maxEditingCost),
      isDiscontinued:
        req.body.isDiscontinued === "true" || req.body.isDiscontinued === true,
      sizeStock: req.body.sizeStock
        ? JSON.parse(req.body.sizeStock)
        : undefined,
      otherDetails: req.body.otherDetails
        ? JSON.parse(req.body.otherDetails)
        : undefined,
    };

    const validationResult = addProductValidator.safeParse(parsedBody);

    if (!validationResult.success) {
      return apiResponse(
        res,
        false,
        null,
        validationResult.error.errors[0].message,
        400
      );
    }

    const newProduct = new Product(validationResult.data);
    await newProduct.save();

    return apiResponse(
      res,
      true,
      newProduct,
      "Product added successfully",
      201
    );
  } catch (error) {
    return apiResponse(res, false, null, error.message, 500);
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const validationResult = updateProductValidator.safeParse(req.body);
    if (!validationResult.success) {
      return apiResponse(
        res,
        false,
        null,
        validationResult.error.errors[0].message,
        400
      );
    }

    const foundProduct = await Product.findById(id);
    if (!foundProduct) {
      return apiResponse(res, false, null, "Product not found", 404);
    }

    if (req.files && req.files.length > 0) {
      if (foundProduct.imgURL && foundProduct.imgURL.length > 0) {
        deleteFiles(foundProduct.imgURL);
      }

      const imgURL = req.files.map(
        (file) => `/uploads/${path.basename(file.path)}`
      );
      validationResult.data.imgURL = imgURL;
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      validationResult.data,
      { new: true }
    );

    return apiResponse(
      res,
      true,
      updatedProduct,
      "Product updated successfully",
      200
    );
  } catch (error) {
    return apiResponse(res, false, null, error.message, 500);
  }
};

const getAllCustomersOfProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!productId) {
      return apiResponse(res, false, null, "Product ID is required", 400);
    }

    const productObjectId = new mongoose.Types.ObjectId(productId);

    const pipeline = [
      {
        $match: {
          productId: productObjectId,
        },
      },
      {
        $sort: {
          orderDate: -1,
        },
      },
      {
        $project: {
          customerId: 1,
        },
      },
    ];

    const result = await Order.aggregate(pipeline);

    if (result.length > 0) {
      apiResponse(res, true, result, "Customers fetched successfully", 200);
    } else {
      apiResponse(res, true, null, "No customers found for this product", 204);
    }
  } catch (error) {
    apiResponse(res, false, null, `Error: ${error.message}`, 500);
  }
};

const getAllProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const validationResult = getAllProductsFilterValidator.safeParse(req.body);
    if (!validationResult.success) {
      return apiResponse(
        res,
        false,
        null,
        validationResult.error.errors[0].message,
        400
      );
    }

    const {
      size,
      sleeve,
      customizeOption,
      color,
      price,
      availability,
      sortOrder,
    } = validationResult.data;

    const filterQuery = {};

    if (size && size.length > 0) {
      filterQuery.size = { $in: size };
    }

    if (sleeve && sleeve.length > 0) {
      filterQuery.sleeve = { $in: sleeve };
    }

    if (customizeOption && customizeOption.length > 0) {
      filterQuery.customizeOption = { $in: customizeOption };
    }

    if (color && color.length > 0) {
      filterQuery.color = { $in: color };
    }

    if (price && price.length === 2) {
      filterQuery.price = { $gte: price[0], $lte: price[1] };
    }

    if (availability && !availability.includes("All")) {
      if (availability.includes("Discontinued")) {
        filterQuery.isDiscontinued = true;
      } else if (availability.includes("Available")) {
        filterQuery.isDiscontinued = false;
      }
    }

    const sortOptions = {};
    if (sortOrder === "lowToHigh") {
      sortOptions.price = 1;
    } else if (sortOrder === "highToLow") {
      sortOptions.price = -1;
    }

    const products = await Product.find(filterQuery)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit);

    const totalProducts = await Product.countDocuments({
      filterQuery,
      isDiscontinued : false,
    });

    return apiResponse(
      res,
      true,
      {
        products,
        pagination: {
          totalProducts,
          page,
          limit,
          totalPages: Math.ceil(totalProducts / limit),
        },
      },
      "Products fetched successfully",
      200
    );
  } catch (error) {
    return apiResponse(res, false, null, error.message, 500);
  }
};

const getAllActiveProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const validationResult = getAllActiveProductsFilterValidator.safeParse(
      req.body
    );
    if (!validationResult.success) {
      return apiResponse(
        res,
        false,
        null,
        validationResult.error.errors[0].message,
        400
      );
    }

    const { size, sleeve, customizeOption, color, price, sortOrder } =
      validationResult.data;

    const filterQuery = {
      isDiscontinued: false,
    };

    if (size && size.length > 0) {
      filterQuery.size = { $in: size };
    }

    if (sleeve && sleeve.length > 0) {
      filterQuery.sleeve = { $in: sleeve };
    }

    if (customizeOption && customizeOption.length > 0) {
      filterQuery.customizeOption = { $in: customizeOption };
    }

    if (color && color.length > 0) {
      filterQuery.color = { $in: color };
    }

    if (price && price.length === 2) {
      filterQuery.price = { $gte: price[0], $lte: price[1] };
    }

    const sortOptions = {};
    if (sortOrder === "lowToHigh") {
      sortOptions.price = 1;
    } else if (sortOrder === "highToLow") {
      sortOptions.price = -1;
    }

    const products = await Product.find(filterQuery)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)

    const totalProducts = await Product.countDocuments(filterQuery);

    return apiResponse(
      res,
      true,
      {
        products,
        pagination: {
          totalProducts,
          page,
          limit,
          totalPages: Math.ceil(totalProducts / limit),
        },
      },
      "Active products fetched successfully",
      200
    );
  } catch (error) {
    return apiResponse(res, false, null, error.message, 500);
  }
};

const getSingleProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const singleProduct = await Product.findById(id);

    if (!singleProduct) {
      return apiResponse(res, false, null, "Product not found", 404).select(
        "+description +otherDetails +noOfRatings"
      );
    }

    return apiResponse(
      res,
      true,
      singleProduct,
      "Product fetched successfully",
      200
    );
  } catch (error) {
    return apiResponse(res, false, null, error.message, 500);
  }
};

const disContinueProducts = async (req, res) => {
  try {
    const validationResult = productIdsValidator.safeParse(req.body);
    if (!validationResult.success) {
      return apiResponse(
        res,
        false,
        null,
        validationResult.error.errors[0].message,
        400
      );
    }

    const { products } = validationResult.data;

    for (const productId of products) {
      const foundProduct = await Product.findById(productId);
      if (!foundProduct) {
        return apiResponse(
          res,
          false,
          null,
          `Product ${productId} not found`,
          404
        );
      }

      foundProduct.isDiscontinued = true;
      await foundProduct.save();
    }

    return apiResponse(
      res,
      true,
      null,
      products.length === 1
        ? `Product ${products[0]} is discontinued successfully`
        : "Products are discontinued successfully",
      200
    );
  } catch (error) {
    return apiResponse(res, false, null, error.message, 500);
  }
};

const reContinueProducts = async (req, res) => {
  try {
    const validationResult = productIdsValidator.safeParse(req.body);
    if (!validationResult.success) {
      return apiResponse(
        res,
        false,
        null,
        validationResult.error.errors[0].message,
        400
      );
    }

    const { products } = validationResult.data;

    for (const productId of products) {
      const foundProduct = await Product.findById(productId);
      if (!foundProduct) {
        return apiResponse(
          res,
          false,
          null,
          `Product ${productId} not found`,
          404
        );
      }

      foundProduct.isDiscontinued = false;
      await foundProduct.save();
    }

    return apiResponse(
      res,
      true,
      null,
      products.length === 1
        ? `Product ${products[0]} is recontinued successfully`
        : "Products are recontinued successfully",
      200
    );
  } catch (error) {
    return apiResponse(res, false, null, error.message, 500);
  }
};

export {
  addProduct, // done
  getAllCustomersOfProduct,
  getAllProducts, // done
  getAllActiveProducts, // done
  getSingleProduct, // done
  updateProduct, 
  disContinueProducts, // done
  reContinueProducts, // done
};
