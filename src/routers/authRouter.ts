import AuthControllers from "../controllers/authController.js";
import { Router } from "express";
import { isAuthenticated } from "../middlewares/authMiddleware.js";

const authRouter: Router = Router();

authRouter.post("/register", AuthControllers.register);
authRouter.post("/login", AuthControllers.login);

authRouter.post(
  "/reset-password-request",
  AuthControllers.resetPasswordRequest,
);
authRouter.post("/reset-password/:token", AuthControllers.resetPassword);

authRouter.post("/protected", isAuthenticated, AuthControllers.verifyToken);

export default authRouter;
