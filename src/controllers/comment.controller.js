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

export { addComment, updateComment, deleteComment };
