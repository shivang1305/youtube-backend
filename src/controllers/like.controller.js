import mongoose from "mongoose";
import { Like } from "../models/like.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";

// TODO: testing of the api is pending, since the likes are not created in db
// get all the videos that are liked by the logged in user
const getLikedVideos = asyncHandler(async (req, res) => {
  const likedVideos = await Like.aggregate([
    {
      $match: {
        likedBy: new mongoose.Types.ObjectId(req.user._id),
      },
    },
    {
      $project: {
        video: 1,
      },
    },
  ]);

  console.log(likedVideos);

  if (!likedVideos.length)
    throw new ApiError(404, "no video is liked by the user");

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        likedVideos,
        "liked videos list fetched successfully"
      )
    );
});

export { getLikedVideos };
