import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  deleteVideo,
  getVideoById,
  publishVideo,
  togglePublishStatus,
  updateVideo,
} from "../controllers/video.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();
router.use(verifyJWT);

router.route("/publish").post(
  upload.fields([
    {
      name: "videoFile",
      maxCount: 1,
    },
    {
      name: "thumbnail",
      maxCount: 1,
    },
  ]),
  publishVideo
);

router.route("/video/:videoId").get(getVideoById);

// update video api does not allow to change/update the video itself
// for that you have to delete the video and publish a new video
router.route("/update/:videoId").patch(upload.single("thumbnail"), updateVideo);

router.route("/delete/:videoId").delete(deleteVideo);

router.route("/toggle-publish/:videoId").patch(togglePublishStatus);

export default router;
