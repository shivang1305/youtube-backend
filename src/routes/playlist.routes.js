import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  addVideo,
  createPlaylist,
  getUserPlaylists,
  removeVideo,
  updatePlaylist,
} from "../controllers/playlist.controller.js";

const router = Router();

router.use(verifyJWT);

router.route("/create").post(createPlaylist);
router.route("/add-video/playlist/:playlistId/video/:videoId").patch(addVideo);
router
  .route("/delete-video/playlist/:playlistId/video/:videoId")
  .patch(removeVideo);

router.route("/update/:playlistId").patch(updatePlaylist);
router.route("/user/:userId").get(getUserPlaylists);

export default router;
