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

postRouter.put("/edit", isAuthenticated, PostController.editPost);

export default postRouter;
