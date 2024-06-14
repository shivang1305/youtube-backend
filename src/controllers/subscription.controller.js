import { Subscription } from "../models/subscription.model.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  if (!channelId) throw new ApiError(404, "channelId is missing");

  //check of the logged in user is a subscriber or not
  const isSubscriber = await Subscription.findOne({
    subscriber: req.user._id,
    channel: channelId,
  });

  let isSubscribed = false;

  if (isSubscriber) {
    await Subscription.findByIdAndDelete(isSubscriber._id);
  } else {
    const subscribed = await Subscription.create({
      subscriber: req.user._id,
      channel: channelId,
    });

    if (!subscribed)
      throw new ApiError(500, "Something went wrong while subscribing");

    isSubscribed = true;
  }

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        { isSubscribed },
        "subscription toggled successfully"
      )
    );
});

const getChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  if (!channelId) throw new ApiError(404, "channelId is missing");

  const subscribers = await Subscription.find({
    channel: channelId,
  });

  const subscriberCount = subscribers.length | 0;

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        { subscriberCount },
        "Subscriber count fetched successfully"
      )
    );
});

export { toggleSubscription, getChannelSubscribers };
