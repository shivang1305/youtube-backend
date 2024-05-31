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

const addVideo = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  if (!playlistId) throw new ApiError(404, "playlistId is missing");
  if (!videoId) throw new ApiError(404, "videoId is missing");

  const playlist = await Playlist.findById(playlistId);

  if (!playlist) throw new ApiError(404, "playlist not found");

  if (!playlist?.videos?.includes(videoId)) {
    playlist?.videos?.push(videoId);
    await playlist.save();
  }

  return res
    .status(201)
    .json(
      new ApiResponse(201, playlist, "video added to playlist successfully")
    );
});

const removeVideo = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  if (!playlistId) throw new ApiError(404, "playlistId is missing");
  if (!videoId) throw new ApiError(404, "videoId is missing");

  const playlist = await Playlist.findById(playlistId);

  if (!playlist) throw new ApiError(404, "playlist not found");

  const videos = playlist.videos;

  if (!videos.includes(videoId))
    throw new ApiError(404, "video not a part of playlist");

  const targetIndex = videos.indexOf(videoId);
  if (targetIndex > -1) videos.splice(targetIndex, 1);

  playlist.videos = videos;
  await playlist.save();

  return res
    .status(201)
    .json(
      new ApiResponse(201, playlist, "video delete from playlist successfully")
    );
});

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

export { createPlaylist, addVideo, removeVideo, getUserPlaylists };
