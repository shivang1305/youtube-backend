import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getLikedVideos } from "../controllers/like.controller.js";

const router = Router();
router.use(verifyJWT);

router.route("/liked-videos").get(getLikedVideos);

export default router;
