import { Router } from "express";
import { loginUser, registerUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import {
  validateLoginUser,
  validateRegisterUser,
} from "../validators/user.validator.js";

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

export default router;
