import { Router } from "express";
import {
  changePassword,
  getCurrentUser,
  getUserChannelProfile,
  getWatchHistory,
  loginUser,
  logoutUser,
  registerUser,
  renewAccessToken,
  updateUserAvatar,
  updateUserDetails,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import {
  validateLoginUser,
  validateRegisterUser,
} from "../validators/user.validator.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(
  upload.fields([
    // applying upload middleware before calling the controller on the route
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  validateRegisterUser,
  registerUser
);

router.route("/login").post(validateLoginUser, loginUser);

// secured routes
router.route("/logout").get(verifyJWT, logoutUser);
router.route("/renew-access-token").get(verifyJWT, renewAccessToken);
router.route("/current-user").get(verifyJWT, getCurrentUser);
router.route("/change-password").post(verifyJWT, changePassword);
router.route("/update-profile").patch(verifyJWT, updateUserDetails);
router.route("/update-avatar").patch(
  verifyJWT,
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
  ]),
  updateUserAvatar
);
router.route("/channel/:username").get(verifyJWT, getUserChannelProfile);
router.route("/watch-history").get(verifyJWT, getWatchHistory);
export default router;
