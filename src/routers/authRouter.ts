import AuthControllers from "../controllers/authController.js";
import { Router } from "express";

const authRouter: Router = Router();
const authControllers = new AuthControllers();

authRouter.post("/register", authControllers.register);
authRouter.post("/login", authControllers.login);

authRouter.post(
  "/reset-password-request",
  authControllers.resetPasswordRequest,
);
authRouter.post("/reset-password/:token", authControllers.resetPassword);

export default authRouter;
