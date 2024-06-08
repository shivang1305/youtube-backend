import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  getLikedVideos,
  toggleLikeComment,
  toggleLikeVideo,
} from "../controllers/like.controller.js";

const router = Router();
router.use(verifyJWT);

router.route("/video-like/:videoId").post(toggleLikeVideo);
router.route("/comment-like/:commentId").post(toggleLikeComment);
router.route("/liked-videos").get(getLikedVideos);

export default router;
