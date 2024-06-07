import mongoose from "mongoose";
import { Like } from "../models/like.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";

// toggle ---> search for video, post and comment in the like object
// if exists ---> remove that from the like object
// if not exists ---> add that into the like object

const toggleLikeVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  // search for the like object in db for the curr logged in user
  const like = await Like.find({
    likedBy: new mongoose.Types.ObjectId(req.user._id),
  });

  if (!like)
    await Like.create({
      // create a like object for this user
    });
  else {
    // check if the video exists in the like obj
    // if exits ---> remove the video
    // if don't exist ---> add the video
  }
});

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

export { toggleLikeVideo, getLikedVideos };
