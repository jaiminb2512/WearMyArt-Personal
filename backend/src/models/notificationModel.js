import { model, Schema, Types } from "mongoose";

const notificationSchema = new Schema(
  {
    userId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["order", "product", "address", "system"],
      default: "system",
    },
    read: {
      type: Boolean,
      default: false,
    },
    orderId: {
      type: Types.ObjectId,
      ref: "Order",
      select: false,
    },
    productId: {
      type: Types.ObjectId,
      ref: "Product",
      select: false,
    },
  },
  { timestamps: true }
);

const Notification = model("Notification", notificationSchema);

export default Notification;
