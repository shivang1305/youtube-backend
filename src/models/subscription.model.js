import mongoose, { Schema } from "mongoose";

const subscriptionSchema = new Schema(
  {
    // here subscriber & channel both are a type of user only
    subscriber: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    channel: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export const Subscription = mongoose.model("Subscription", subscriptionSchema);
