import ApiError from "../utils/ApiError.js";
import {
  deleteFromCloudinary,
  uploadOnCloudinary,
} from "../utils/Cloudinary.js";
import asyncHandler from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js";
import ApiResponse from "../utils/ApiResponse.js";
import mongoose from "mongoose";

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
  const publishedVideo = await Video.findById(video._id).select();

  if (!publishedVideo)
    throw new ApiError(500, "error while publishing the video");

  return res
    .status(201)
    .json(new ApiResponse(201, video, "video published successfully"));
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId.trim()) throw new ApiError(400, "videoId is missing");

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

  if (!video) throw new ApiError(401, "video not found");

  return res
    .status(200)
    .json(new ApiResponse(201, video, "video is fetched successfully"));
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  const { title, description } = req.body;
  const thumbnailLocalPath = req.file.path;

  if (!title && !description && !thumbnailLocalPath)
    throw new ApiError(400, "No fields are provided for updation");

  let video;

  if (title && description) {
    video = await Video.findByIdAndUpdate(
      videoId,
      {
        $set: {
          title,
          description,
        },
      },
      { new: true }
    );
  } else if (title) {
    video = await Video.findByIdAndUpdate(
      videoId,
      {
        $set: {
          title,
        },
      },
      { new: true }
    );
  } else if (description) {
    video = await Video.findByIdAndUpdate(
      videoId,
      {
        $set: {
          description,
        },
      },
      { new: true }
    );
  }

  // updation of the thumbnail of video
  if (thumbnailLocalPath) {
    let oldThumbnail;
    if (!video) video = await Video.findById(videoId);

    oldThumbnail = video.thumbnail.split("/").slice(-1)[0].split(".")[0];

    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

    if (!thumbnail.url)
      throw new ApiError(401, "Error while uploading thumbnail on cloudinary");

    video = await Video.findByIdAndUpdate(
      videoId,
      {
        $set: {
          thumbnail: thumbnail?.url,
        },
      },
      { new: true }
    );

    deleteFromCloudinary(oldThumbnail);

    return res
      .status(200)
      .json(new ApiResponse(201, video, "video details updated successfully"));
  }
});

export { publishVideo, getVideoById, updateVideo };
