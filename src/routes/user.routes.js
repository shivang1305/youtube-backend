import { Router } from "express";
import {
  getCurrentUser,
  loginUser,
  logoutUser,
  registerUser,
  renewAccessToken,
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
router.route("/update-profile").post(verifyJWT, updateUserDetails);
router.route("/update-avatar").post(
  verifyJWT,
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
  ])
);

export default router;
