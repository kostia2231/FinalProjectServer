import AuthControllers from "../controllers/authController.js";
import { Router } from "express";

const authRouter: Router = Router();
const authControllers = new AuthControllers();

authRouter.post("/register", authControllers.register);
authRouter.post("/login", authControllers.login);

export default authRouter;
