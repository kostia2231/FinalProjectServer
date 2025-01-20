import { Router } from "express";
import CommentLikeController from "../controllers/commentLikeController.js";
import { isAuthenticated } from "../middlewares/authMiddleware.js";

const commentlikeRouter = Router();

commentlikeRouter.post(
  "/comment/:commentId",
  isAuthenticated,
  CommentLikeController.likeComment,
);
commentlikeRouter.delete(
  "/comment/:commentId/unlike",
  isAuthenticated,
  CommentLikeController.unlikeComment,
);
commentlikeRouter.get(
  "/comment/:commentId/like-status",
  isAuthenticated,
  CommentLikeController.checkLikeStatus,
);

export default commentlikeRouter;
