import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

const addComment = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { content } = req.body;

  if (!videoId) throw new ApiError(404, "videoId is missing");
  if (!content) throw new ApiError(404, "comment not found");

  const comment = await Comment.create({
    content,
    video: videoId,
    owner: req.user._id,
  });

  if (!comment)
    throw new ApiError(500, "Something went wrong while adding comment");

  return res
    .status(201)
    .json(new ApiResponse(201, comment, "comment added successfully"));
});

const updateComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const { content } = req.body;

  if (!commentId) throw new ApiError(404, "commentId is missing");
  if (!content) throw new ApiError(404, "no content found to update comment");

  const comment = await Comment.findById(commentId);

  if (!comment) throw new ApiError(404, "comment not found");

  if (!comment.owner.equals(req.user._id))
    throw new ApiError(401, "Unauthorized access");

  comment.content = content;
  await comment.save();

  return res
    .status(201)
    .json(new ApiResponse(201, comment, "comment updated successfully"));
});

const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  if (!commentId) throw new ApiError(404, "commentId is missing");

  const comment = await Comment.findByIdAndDelete(commentId);

  if (!comment) throw new ApiError(404, "comment not found");

  return res
    .status(201)
    .json(new ApiResponse(201, comment, "comment deleted successfully"));
});

const getVideoComments = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  if (!videoId) throw new ApiError(404, "videoId is required");

  const comments = await Comment.aggregate([
    {
      $match: {
        video: new mongoose.Types.ObjectId(videoId),
      },
    },
    {
      $lookup: {
        from: "users",
        foreignField: "_id",
        localField: "owner",
        as: "owner",
        pipeline: [
          {
            $project: {
              username: 1,
              fullName: 1,
              avatar: 1,
              _id: 1,
            },
          },
        ],
      },
    },
    {
      $lookup: {
        from: "likes",
        foreignField: "comment",
        localField: "_id",
        as: "likes",
      },
    },
    {
      $addFields: {
        likesCount: {
          $size: "$likes",
        },
      },
    },
    {
      $project: {
        _id: 1,
        username: 1,
        fullName: 1,
        avatar: 1,
        content: 1,
        owner: 1,
        likesCount: 1,
      },
    },

    // pagination
    {
      $skip: (page - 1) * limit,
    },
    {
      $limit: parseInt(limit),
    },
  ]);

  if (!comments.length) throw new ApiError(404, "No comments found");

  return res
    .status(201)
    .json(new ApiResponse(201, comments, "comments fetched successfully"));
});

export { addComment, updateComment, deleteComment, getVideoComments };
