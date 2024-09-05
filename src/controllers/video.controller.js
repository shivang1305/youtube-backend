import ApiError from "../utils/ApiError.js";
import {
  deleteFromCloudinary,
  uploadOnCloudinary,
} from "../utils/Cloudinary.js";
import asyncHandler from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js";
import ApiResponse from "../utils/ApiResponse.js";
import mongoose from "mongoose";

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.body;

  if (!query || query.trim() === "")
    throw new ApiError(400, "Query is required");

  const videos = await Video.aggregate([
    {
      $match: {
        $or: [
          {
            title: { $regex: query, $options: "i" },
          },
          {
            description: { $regex: query, $options: "i" },
          },
        ],
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
              avatar: 1,
              username: 1,
              fullName: 1,
            },
          },
        ],
      },
    },
    {
      $project: {
        videoFile: 1,
        thumbnail: 1,
        owner: 1,
        _id: 1,
        title: 1,
        description: 1,
        views: 1,
        duration: 1,
        isPublished: 1,
      },
    },

    // sorting & pagination
    {
      $sort: {
        [sortBy]: sortType === "asc" ? 1 : -1,
      },
    },
    {
      $skip: (page - 1) * limit,
    },
    {
      $limit: parseInt(limit),
    },
  ]);

  if (!videos.length) throw new ApiError(404, "No videos found");

  return res
    .status(201)
    .json(new ApiResponse(201, videos, "Videos fetched successfully"));
});

const publishVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;

  const videoFileLocalPath = req.files?.videoFile[0]?.path;
  const thumbnailLocalPath = req.files?.thumbnail[0]?.path;

  if (!videoFileLocalPath)
    throw new ApiError(400, "video file is not provided");
  if (!thumbnailLocalPath) throw new ApiError(400, "thumbnail is not provided");

  const videoFile = await uploadOnCloudinary(videoFileLocalPath);
  const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

  if (!videoFile || !thumbnail)
    throw new ApiError(400, "error uploading video or thumbnail on cloudinary");

  const video = await Video.create({
    title,
    description,
    videoFile: videoFile?.url,
    thumbnail: thumbnail?.url,
    duration: videoFile?.duration,
    owner: req.user,
  });

  // check if the video is created in the db or not
  const publishedVideo = await Video.findById(video._id);

  if (!publishedVideo)
    throw new ApiError(500, "error while publishing the video");

  return res
    .status(201)
    .json(new ApiResponse(201, video, "video published successfully"));
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId.trim()) throw new ApiError(404, "videoId is missing");

  const video = await Video.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(videoId.trim()),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
        pipeline: [
          {
            $project: {
              fullName: 1,
              username: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        owner: {
          $first: "$owner",
        },
      },
    },
  ]);

  if (!video.length) throw new ApiError(404, "video not found");

  return res
    .status(200)
    .json(new ApiResponse(201, video, "video is fetched successfully"));
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId.trim()) throw new ApiError(404, "videoId is missing");

  const { title, description } = req.body;
  const thumbnailLocalPath = req?.file?.path;

  if (!title && !description && !thumbnailLocalPath)
    throw new ApiError(400, "No fields are provided for updation");

  const video = await Video.findById(videoId);

  if (!video) throw new ApiError(404, "video not found");

  if (title) video.title = title;
  if (description) video.description = description;

  // updation of the thumbnail of video
  if (thumbnailLocalPath) {
    let oldThumbnail;

    oldThumbnail = video.thumbnail.split("/").slice(-1)[0].split(".")[0];

    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

    if (!thumbnail.url)
      throw new ApiError(401, "Error while uploading thumbnail on cloudinary");

    video.thumbnail = thumbnail?.url;

    deleteFromCloudinary(oldThumbnail);
  }

  await video.save();

  return res
    .status(200)
    .json(new ApiResponse(201, video, "video details updated successfully"));
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId.trim()) throw new ApiError(404, "videoId is missing");

  const video = await Video.findByIdAndDelete(videoId);

  if (!video) throw new ApiError(400, "video not found");

  return res
    .status(200)
    .json(new ApiResponse(200, video, "video deleted successfully"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId.trim()) throw new ApiError(404, "videoId is missing");

  const video = await Video.findById(videoId);

  if (!video) throw new ApiError(404, "video not found");

  video.isPublished = !video.isPublished;
  await video.save();

  return res
    .status(201)
    .json(
      new ApiResponse(201, video, "video published status toggled successfully")
    );
});

export {
  getAllVideos,
  publishVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
