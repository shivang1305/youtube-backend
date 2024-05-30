import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  addVideo,
  createPlaylist,
  getUserPlaylists,
} from "../controllers/playlist.controller.js";

const router = Router();

router.use(verifyJWT);

router.route("/create").post(createPlaylist);
router.route("/add-video/playlist/:playlistId/video/:videoId").patch(addVideo);
router.route("/user/:userId").get(getUserPlaylists); // TODO: testing of this api is pending

export default router;
