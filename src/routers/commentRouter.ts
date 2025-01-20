import CommentController from "../controllers/commentController.js";
import { isAuthenticated } from "../middlewares/authMiddleware.js";
import { Router } from "express";

const commentRouter = Router();

commentRouter.post(
  "/:postId/add",
  isAuthenticated,
  CommentController.addComment,
);

commentRouter.get("/:commentId", isAuthenticated, CommentController.getComment);

commentRouter.get(
  "/all/:postId",
  isAuthenticated,
  CommentController.getAllCommentsForPost,
);

commentRouter.delete(
  "/:commentId/delete",
  isAuthenticated,
  CommentController.deleteComment,
);

export default commentRouter;
