import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
// cookie parser middleware helps the server to perform CRUD operation on the cookies stored in client browser
// server can only access those cookies in a secure way and perform the operations on those cookies.
app.use(cookieParser());

// import routes
import userRouter from "./routes/user.routes.js";
import videoRouter from "./routes/video.routes.js";
import postRouter from "./routes/post.routes.js";
import playlistRouter from "./routes/playlist.routes.js";

// routes declaration
app.use("/api/v1/users", userRouter);
app.use("/api/v1/videos", videoRouter);
app.use("/api/v1/posts", postRouter);
app.use("/api/v1/playlists", playlistRouter);

export default app;
