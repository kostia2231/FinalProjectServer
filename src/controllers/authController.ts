import UserModel from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "node:crypto";
import { Response, Request } from "express";

class AuthControllers {
  public async register(req: Request, res: Response): Promise<void> {
    try {
      const { username, email, fullName, password } = req.body;
      if (!username || !email || !password || !fullName) {
        res.status(400).json({ message: "all fields are required" });
        return;
      }

      const isExist = await UserModel.findOne({
        $or: [{ username }, { email }],
      });
      if (isExist) {
        res.status(400).json({ message: "user already exists" });
        return;
      }

      const salt: number = 10;
      const hashedPassword = await bcrypt.hash(password, salt);

      const newUser = new UserModel({
        username,
        email,
        fullName,
        password: hashedPassword,
      });

      await newUser.save();

      res.status(201).json({ message: "user created successfully" });
      return;
    } catch (err) {
      res
        .status(500)
        .json({ message: "server error", error: (err as Error).stack });
    }
  }

  public async login(req: Request, res: Response): Promise<void> {
    try {
      const { username, email, password } = req.body;
      if ((!username && !password) || (!email && !password)) {
        res.status(400).json({ message: "wrong credentials" });
        return;
      }

      const user = await UserModel.findOne({
        $or: [{ username }, { email }],
      });
      if (!user) {
        res.status(400).json({ message: "user doesn't exist" });
        return;
      }

      const passwordCorrect = await bcrypt.compare(password, user.password);
      if (!passwordCorrect) {
        res.status(400).json({ message: "wrong credentials" });
        return;
      }

      const token = jwt.sign(
        { id: user._id, username: user.username, email: user.email },
        process.env.JWT_SECRET as string,
        { expiresIn: "6h" },
      );

      res.status(200).json({ message: "login successful", token });
      return;
    } catch (err) {
      res
        .status(500)
        .json({ message: "server error", error: (err as Error).stack });
    }
  }

  public async newPasswordRequest(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;
      if (!email) {
        res.status(400).json({ message: "email is required" });
        return;
      }

      const user = await UserModel.findOne({ $or: [{ email }] });
      if (!user) {
        res.status(404).json({ message: "account doesn't exists" });
        return;
      }

      const resetToken = crypto.randomBytes(20).toString("hex");
      const resetTokenExpiresAt = new Date(Date.now() + 60 * 60 * 1000);

      user.resetPasswordToken = resetToken;
      user.resetPasswordExpiresAt = resetTokenExpiresAt;

      await user.save();

      //send an email to a user func

      res
        .status(200)
        .json({ message: "password reset token generated", resetToken });
    } catch (err) {
      res
        .status(500)
        .json({ message: "server error", error: (err as Error).stack });
    }
  }
}

export default AuthControllers;
