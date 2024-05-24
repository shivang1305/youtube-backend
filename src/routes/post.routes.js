import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createPost } from "../controllers/post.controller.js";

const router = Router();
router.use(verifyJWT);

router.route("/create").post(createPost);

export default router;
