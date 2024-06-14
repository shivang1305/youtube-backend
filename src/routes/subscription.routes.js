import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  getChannelSubscribers,
  toggleSubscription,
} from "../controllers/subscription.controller.js";

const router = Router();
router.use(verifyJWT);

router.route("/subscribe/:channelId").post(toggleSubscription);
router.route("/channel-subscribers/:channelId").get(getChannelSubscribers);

export default router;
