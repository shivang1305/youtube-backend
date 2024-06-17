import { Video } from "../models/video.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

const getChannelVideos = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  if (!channelId) throw new ApiError(404, "channelId is missing");

  const channelVideos = await Video.find({ owner: channelId });

  if (!channelVideos.length) {
    return res
      .status(201)
      .json(
        new ApiResponse(
          201,
          { message: "No video is uploaded on this channel" },
          "channel videos fetched successfully"
        )
      );
  }

  return res
    .status(201)
    .json(
      new ApiResponse(201, channelVideos, "channel videos fetched successfully")
    );
});

const getChannelStats = asyncHandler(async (req, res) => {
  // TODO: implement the api
});

export { getChannelVideos, getChannelStats };
