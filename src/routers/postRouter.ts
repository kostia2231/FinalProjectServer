import PostController from "../controllers/postController.js";
import { Router } from "express";
import { isAuthenticated } from "../middlewares/authMiddleware.js";
import { uploadMiddleware } from "../middlewares/uploadMiddleware.js";

const postRouter: Router = Router();

postRouter.post(
  "/create",
  isAuthenticated,
  uploadMiddleware,
  PostController.createPost,
);

postRouter.get("/:postId", isAuthenticated, PostController.getPost);
postRouter.get("/all/:userId", PostController.getUserPosts);
postRouter.get("/posts/all", isAuthenticated, PostController.getAllPosts);
postRouter.get(
  "/:userId/all-following-posts",
  isAuthenticated,
  PostController.getFollowingPosts,
);

postRouter.put("/edit/:postId", isAuthenticated, PostController.editPost);

postRouter.delete(
  "/delete/:postId",
  isAuthenticated,
  PostController.deletePost,
);

export default postRouter;
