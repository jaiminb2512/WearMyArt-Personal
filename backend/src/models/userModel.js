import { model, Schema, Types } from "mongoose";

const UserSchema = new Schema(
  {
    profileImage: {
      type: String,
    },
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    OTP: {
      type: Number,
      required: true,
      select: false,
    },
    OTPExpiry: {
      type: Date,
      select: false,
    },
    wishlist: {
      type: [{ type: Types.ObjectId, ref: "Product" }],
      select: false,
    },
    addresses: {
      type: [
        {
          label: {
            type: String,
            required: true,
          },
          addressId: {
            type: Schema.Types.ObjectId,
            ref: "UserAddress",
            required: true,
          },
        },
      ],
      select: false, 
    },
    purchaseInfo: {
      noOfProductPurchased: {
        type: Number,
      },
      totalSpeding: {
        type: Number,
      },
    },
  },
  { timestamps: true }
);

const User = model("User", UserSchema);

export default User;
