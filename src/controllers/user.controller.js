import { validationResult } from "express-validator";
import asyncHandler from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import { uploadOnCloudinary } from "../utils/Cloudinary.js";

const registerUser = asyncHandler(async (req, res) => {
  try {
    // get the user data from the req
    const { fullName, username, email, password } = req.body;

    // check if the user already exists
    const existedUser = User.findOne({
      $or: [{ username }, { email }],
    });

    if (existedUser)
      throw new ApiError(409, "This email or username already exists");

    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.avatar[0]?.path;

    if (!avatarLocalPath) throw new ApiError(400, "avatar file is required");

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if (!avatar) throw new ApiError(400, "avatar file is not uploaded");

    res.json(req.body);
  } catch (error) {
    console.log(error);
  }
});

export { registerUser };
