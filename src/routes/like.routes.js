import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  getLikedVideos,
  toggleLikeComment,
  toggleLikePost,
  toggleLikeVideo,
} from "../controllers/like.controller.js";

const router = Router();
router.use(verifyJWT);

router.route("/video-like/:videoId").post(toggleLikeVideo);
router.route("/comment-like/:commentId").post(toggleLikeComment);
router.route("/post-like/:postId").post(toggleLikePost);
router.route("/liked-videos").get(getLikedVideos);

export default router;
