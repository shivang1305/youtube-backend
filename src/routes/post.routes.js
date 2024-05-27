import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  createPost,
  getUserPosts,
  updatePosts,
} from "../controllers/post.controller.js";

const router = Router();
router.use(verifyJWT);

router.route("/create").post(createPost);
router.route("/list-all/:userId").post(getUserPosts);
router.route("/update/:postId").patch(updatePosts);

export default router;
