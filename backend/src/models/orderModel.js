import { model, Schema, Types } from "mongoose";

const OrderSchema = new Schema(
  {
    customerId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: [
        "Cart",
        "Pending",
        "Process",
        "Ready",
        "Shipped",
        "Completed",
        "Rejected",
      ],
      required: true,
    },
    totalAmount: {
      type: Number,
    },
    paymentInfo: {
      type: {
        method: {
          type: String,
          enum: ["Credit Card", "PayPal", "Bank Transfer", "Other"],
        },
        transactionId: { type: String },
        paymentStatus: {
          type: String,
          enum: ["Pending", "Paid", "Failed", "Refunded"],
          default: "Pending",
        },
      },
      select: false,
    },
    orderNotes: {
      type: String,
      select: false,
    },
    shippingInfo: {
      type: {
        shippingAddress: {
          type: Types.ObjectId,
          ref: "UserAddress",
        },
        shippingCharge: {
          type: Number,
          required: true,
        },
      },
      select: false,
    },
    rejectionMessage: {
      type: String,
      select: false,
    },
    purchasedProductDetails: [
      {
        productId: {
          type: Types.ObjectId,
          ref: "Product",
          required: true,
        },
        customizedType: {
          type: String,
          enum: ["Photo", "Text", "Both"],
          required: true,
        },
        font: { type: String },
        text: { type: String },
        textColor: { type: String },
        textStyle: { type: [String], default: [] },
        customerImgForProduct: { type: String },
        finalProductImg: { type: String, required: true },
        quantity: { type: Number, default: 1 },
        finalCostOfProduct: { type: Number, required: true },
        status: {
          type: String,
          enum: ["Pending", "Accepted", "Rejected"],
          default: "Pending",
        },
        rejectionMessage: {
          type: String,
          select: false, 
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Order = model("Order", OrderSchema);

export default Order;
