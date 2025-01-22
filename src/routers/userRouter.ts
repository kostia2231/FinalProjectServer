import { Router } from "express";
import { isAuthenticated } from "../middlewares/authMiddleware.js";
import UserControllers from "../controllers/userController.js";
import { uploadAvatar } from "../middlewares/uploadMiddleware.js";
const uploadProfileImage = uploadAvatar.single("profileImg");

const userRouter: Router = Router();

userRouter.get("/:username", isAuthenticated, UserControllers.getUser);
userRouter.get("/id/:userId", isAuthenticated, UserControllers.getUserById);

userRouter.get("/", isAuthenticated, UserControllers.searchUser);

userRouter.put(
  "/:username/edit",
  isAuthenticated,
  uploadProfileImage,
  UserControllers.updateUser,
);

export default userRouter;
