import { model, Schema, Types } from "mongoose";

const ratingsSchema = Schema({
  productId: {
    type: Types.ObjectId,
    ref: "Product",
    required: true,
  },
  ratingCounts: {
    1: { type: Number, default: 0 },
    2: { type: Number, default: 0 },
    3: { type: Number, default: 0 },
    4: { type: Number, default: 0 },
    5: { type: Number, default: 0 },
  },
  ratedBy: {
    type: [
      {
        type: Types.ObjectId,
        ref: "User",
      },
    ],
    select: false,
  },
});

const Ratings = model("Ratings", ratingsSchema);

export default Ratings;
