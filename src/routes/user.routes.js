import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { validateRegisterUser } from "../validators/user.validator.js";

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

export default router;
