import mongoose from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  if (!name) throw new ApiError(404, "playlist name is missing");

  const playlist = await Playlist.create({
    name,
    description,
  });

  if (!playlist)
    throw new ApiError(500, "something went wrong while creating playlist");

  playlist.owner = req.user._id;
  await playlist.save();

  return res
    .status(201)
    .json(new ApiResponse(201, playlist, "playlist created successfully"));
});

// TODO: testing of this api is pending
const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!userId) throw new ApiError(404, "userId is missing");

  const userPlaylists = await Playlist.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "video",
        foreignField: "_id",
        as: "video",
      },
    },
  ]);

  if (!userPlaylists.length)
    throw new ApiError(404, "no playlist found for this userId");

  return res
    .status(201)
    .json(
      new ApiResponse(201, userPlaylists, "playlists fetched successfully")
    );
});

export { createPlaylist, getUserPlaylists };
