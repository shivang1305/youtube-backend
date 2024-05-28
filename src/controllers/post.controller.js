import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { Post } from "../models/post.model.js";
import { uploadOnCloudinary } from "../utils/Cloudinary.js";
import ApiResponse from "../utils/ApiResponse.js";

const createPost = asyncHandler(async (req, res) => {
  const { content } = req.body;
  const imageLocalPath = req?.file?.path;

  if (!content) throw new ApiError(404, "no content found for the post");

  let image;
  if (imageLocalPath) image = await uploadOnCloudinary(imageLocalPath);

  const post = await Post.create({
    content,
    owner: req.user,
    image: image?.url || "",
  });

  const createdPost = await Post.findById(post._id);

  if (!createdPost) throw new ApiError(500, "error while creating the post");

  return res
    .status(200)
    .json(new ApiResponse(200, post, "post created successfully"));
});

const getUserPosts = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!userId) throw new ApiError(404, "userId not found");

  // list of all the posts from the user
  const posts = await Post.find({ owner: userId });

  if (!posts.length) throw new ApiError(404, "no post found for this user");

  return res
    .status(201)
    .json(new ApiResponse(201, posts, "posts fetched sucessfully"));
});

const updatePosts = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  const { content } = req.body;
  const imageLocalPath = req?.file?.path;

  if (!postId.trim()) throw new ApiError(404, "postId not found");

  if (!content && !imageLocalPath)
    throw new ApiError(404, "no data is provided to update");

  const post = await Post.findById(postId);

  if (!post) throw new ApiError(404, "post not found");

  if (content) post.content = content;
  if (imageLocalPath) {
    let oldImage;

    oldImage = post.image.split("/").slice(-1)[0].split(".")[0];

    const image = await uploadOnCloudinary(thumbnailLocalPath);

    if (!image.url)
      throw new ApiError(401, "Error while uploading thumbnail on cloudinary");

    post.image = image?.url;

    deleteFromCloudinary(oldImage);
  }

  await post.save();

  return res
    .status(201)
    .json(new ApiResponse(201, post, "post details updated successfully"));
});

const deletePosts = asyncHandler(async (req, res) => {
  const { postId } = req.params;

  if (!postId) throw new ApiError(404, "postId is missing");

  const post = await Post.findByIdAndDelete(postId);

  if (!post) throw new ApiError(404, "post not found");

  return res
    .status(200)
    .json(new ApiResponse(200, post, "post deleted successfully"));
});

export { createPost, getUserPosts, updatePosts, deletePosts };
