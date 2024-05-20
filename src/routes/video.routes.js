import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getVideoById, publishVideo } from "../controllers/video.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();
router.use(verifyJWT);

router.route("/publish-video").post(
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

export default router;
