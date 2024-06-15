import { Router } from "express";
import { getChannelVideos } from "../controllers/dashboard.controller.js";

const router = Router();

router.route("/channel-videos/:channelId").get(getChannelVideos);

export default router;
