import LikeController from "../controllers/likeController.js";
import { isAuthenticated } from "../middlewares/authMiddleware.js";
import { Router } from "express";

const likeRouter = Router();

likeRouter.post("/post/:postId", isAuthenticated, LikeController.like);
likeRouter.delete(
  "/post/:postId/unlike",
  isAuthenticated,
  LikeController.unlike,
);
likeRouter.get(
  "/post/:postId/like-status",
  isAuthenticated,
  LikeController.checkLikeStatus,
);

export default likeRouter;
