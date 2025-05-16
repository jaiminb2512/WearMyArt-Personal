import { model, Schema, Types } from "mongoose";

const ProductSchema = new Schema(
  {
    imgURL: {
      type: [String],
      required: true,
      validate: {
        validator: function (value) {
          return value.length <= 5;
        },
        message: "You can upload a maximum of 5 images.",
      },
    },
    sizeStock: {
      type: Map,
      of: Number,
      default: {},
      validate: {
        validator: function (value) {
          const validSizes = ["S", "M", "L", "XL", "XXL"];
          return Array.from(value.keys()).every((size) =>
            validSizes.includes(size)
          );
        },
        message: (props) =>
          `Invalid size key detected in SizeStock: ${Array.from(
            props.value.keys()
          )
            .filter((k) => !["S", "M", "L", "XL", "XXL"].includes(k))
            .join(", ")}`,
      },
    },
    price: {
      type: Number,
      required: true,
    },
    discountedPrice: {
      type: Number,
    },
    sleeve: {
      type: String,
      enum: ["Full Sleeve", "Half Sleeve", "Sleeveless"],
      required: true,
    },
    color: {
      type: String,
      required: true,
    },
    customizeOption: {
      type: String,
      enum: ["Photo", "Text", "Both"],
      required: true,
    },
    description: {
      type: String,
      required: true,
      select: false,
    },
    maxEditingCost: {
      type: Number,
      required: true,
    },
    otherDetails: {
      type: Map,
      of: String,
      default: {},
      select: false,
    },
    isDiscontinued: {
      type: Boolean,
      default: false,
    },
    comments: {
      type: [ { type: Types.ObjectId, ref: "Comment" } ],
      select: false
    },    
    ratingRef: {
      type: Types.ObjectId,
      ref: "Ratings",
      select: false,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: null,
    },
    noOfRatings: {
      type: Number,
      select: false,
    },
  },
  { timestamps: true }
);

const Product = model("Product", ProductSchema);

export default Product;
