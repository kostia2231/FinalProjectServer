import { Router } from "express";
import { isAuthenticated } from "../middlewares/authMiddleware.js";
import UserControllers from "../controllers/userController.js";

const userRouter: Router = Router();

userRouter.get("/:username", isAuthenticated, UserControllers.getUser);
userRouter.get("/", isAuthenticated, UserControllers.searchUser);

userRouter.put("/:username/edit", isAuthenticated, UserControllers.updateUser);

export default userRouter;
