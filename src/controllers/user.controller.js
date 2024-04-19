import { validationResult } from "express-validator";
import asyncHandler from "../utils/asyncHandler.js";

const registerUser = asyncHandler(async (req, res) => {
  try {
    // get the user data from the req
    const { fullName, username, email, password } = req.body;

    res.json(req.body);
  } catch (error) {
    console.log(error);
  }
});

export { registerUser };
