import mongoose from "mongoose";
import { Like } from "../models/like.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";

// like object for a particular video, post, comment

const toggleLikeVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId) throw new ApiError(404, "videoId is missing");

  // find the like object on the given video by the logged in user
  const isLiked = await Like.findOne({
    video: videoId,
    likedBy: req.user._id,
  });

  let videoLiked = false;

  if (!isLiked) {
    // like the video --> toggle like on
    const like = await Like.create({
      video: videoId,
      likedBy: req.user._id,
    });

    videoLiked = true;

    if (!like)
      throw new ApiError(500, "Something went wrong while creating a like");
  } else {
    await Like.findByIdAndDelete(isLiked._id); // toggle like off
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, { videoLiked }, "video like toggled successfully")
    );
});

const toggleLikeComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  if (!commentId) throw new ApiError(404, "commentId is missing");

  // find the like object on the given video by the logged in user
  const isLiked = await Like.findOne({
    comment: commentId,
    likedBy: req.user._id,
  });

  let commentLiked = false;

  if (!isLiked) {
    // like the video --> toggle like on
    const like = await Like.create({
      comment: commentId,
      likedBy: req.user._id,
    });

    commentLiked = true;

    if (!like)
      throw new ApiError(500, "Something went wrong while creating a like");
  } else {
    await Like.findByIdAndDelete(isLiked._id); // toggle like off
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { commentLiked },
        "comment like toggled successfully"
      )
    );
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

export { toggleLikeVideo, toggleLikeComment, getLikedVideos };
