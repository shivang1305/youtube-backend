import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  addComment,
  deleteComment,
  updateComment,
} from "../controllers/comment.controller.js";

const router = Router();

router.use(verifyJWT);
router.route("/add/:videoId").post(addComment);
router.route("/update/:commentId").patch(updateComment);
router.route("/delete/:commentId").delete(deleteComment);

export default router;
