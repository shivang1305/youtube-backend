import { Router } from "express";
import {
  loginUser,
  logoutUser,
  registerUser,
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

export default router;
