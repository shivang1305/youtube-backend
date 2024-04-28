import asyncHandler from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import { uploadOnCloudinary } from "../utils/Cloudinary.js";
import ApiResponse from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

const options = {
  httpOnly: true,
  secure: true,
};

const generateAccessAndRefreshToken = async (userId) => {
  const user = await User.findById(userId);

  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  // update the user instance with generated refresh token
  user.refreshToken = refreshToken;
  // save the updated user instance in db without any validation
  await user.save({ validateBeforeSave: false });

  return { accessToken, refreshToken };
};

const registerUser = asyncHandler(async (req, res) => {
  // get the user data from the req
  const { fullName, username, email, password } = req.body;

  // check if the user already exists
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser)
    throw new ApiError(409, "This email or username already exists");

  // handle the uploading of files to cloudinary
  const avatarLocalPath = req.files?.avatar[0]?.path;
  let coverImageLocalPath;

  // check coverImage is provided or not
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0]?.path;
  }

  // console.log("Avatar Local Path: ", avatarLocalPath);
  // console.log("Cover Image Local Path: ", coverImageLocalPath);

  if (!avatarLocalPath) throw new ApiError(400, "avatar file is required");

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) throw new ApiError(400, "avatar file not uploaded");

  // create the user in db
  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });

  // check if the user is created in db or not
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser)
    throw new ApiError(
      500,
      "Something went wrong while registering user in db"
    );

  return res
    .status(201)
    .json(new ApiResponse(201, createdUser, "User registered successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // check for user in the db
  const user = await User.findOne({ email });

  if (!user) throw new ApiError(401, "user does not exists");

  // match the password
  const isPasswordValid = user.isPasswordCorrect(password);

  if (!isPasswordValid) throw new ApiError(401, "user credentials invalid");

  // generate the access & refresh token
  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );

  // send the tokens in secure cookies
  user.refreshToken = refreshToken;

  return res
    .status(201)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        201,
        {
          accessToken,
          refreshToken,
        },
        "User is logged in successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, {
    $set: {
      refreshToken: undefined,
    },
  });

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});

const renewAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies?.refreshToken || req.body?.refreshToken;

  if (!incomingRefreshToken) throw new ApiError(401, "Unauthorized Request");

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    const user = await User.findById(decodedToken?._id);

    if (!user) throw new ApiError(401, "Invalid Refresh Token");

    if (user?.refreshToken != incomingRefreshToken)
      throw new ApiError(401, "Refresh Token is expired or used");

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
      user._id
    );

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken },
          "Access Token is re-issued"
        )
      );
  } catch (error) {
    throw new ApiError(400, error?.message || "Invalid Refresh Token");
  }
});

export { registerUser, loginUser, logoutUser, renewAccessToken };
