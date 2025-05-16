import { model, Schema, Types } from "mongoose";

const CommentSchema = new Schema(
  {
    productId: {
      type: Types.ObjectId,
      ref: "Product",
      required: true,
    },
    userId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    commentText: {
      type: String,
      required: true,
    },
    parentComment: {
      type: Types.ObjectId,
      ref: "Comment",
      default: null,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    images: {
      type: [String],
      validate: {
        validator: function (value) {
          return value.length <= 5;
        },
        message: "You can upload a maximum of 5 images.",
      },
    },
    likes: {
      type: Number,
      default: 0,
    },
    disLikes: {
      type: Number,
      default: 0,
    },
    isBlock: {
      type: Boolean,
      default: false,
    },
    likedBy: {
      type: [
        {
          type: Types.ObjectId,
          ref: "User",
        },
      ],
      select: false,
    },
    dislikedBy: {
      type: [
        {
          type: Types.ObjectId,
          ref: "User",
        },
      ],
      select: false,
    },
  },
  { timestamps: true }
);

const Comment = new model("Comment", CommentSchema);

export default Comment;
