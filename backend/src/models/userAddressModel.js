import { model, Schema, Types } from "mongoose";

const userAddressSchema = new Schema(
  {
    userId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    addressLine1: {
      type: String,
      required: true,
    },
    addressLine2: {
      type: String,
    },
    landmark: {
      type: String,
    },
    city: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    postalCode: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
    },
    addressType: {
      type: String,
      enum: ["Home", "Work", "Other"],
      default: "Other",
    },
    noOfOrder : {
      type: Number,
      default : 0,
      select : false
    }
  },
  { timestamps: true }
);

const UserAddress = model("UserAddress", userAddressSchema);

export default UserAddress;