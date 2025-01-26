import UserModel from "../models/User.js";
import {
  sendPasswordResetEmail,
  sendPasswordSuccessEmail,
} from "../mailtrap/emails.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "node:crypto";
import { Response, Request } from "express";
import "dotenv/config";

class AuthControllers {
  public static async register(req: Request, res: Response): Promise<void> {
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

      const token = jwt.sign(
        { id: newUser._id, username: newUser.username, email: newUser.email },
        process.env.JWT_SECRET as string,
        { expiresIn: "6h" },
      );

      res.status(201).json({ message: "user created successfully", token });
      return;
    } catch (err) {
      res
        .status(500)
        .json({ message: "server error", error: (err as Error).stack });
    }
  }

  public static async login(req: Request, res: Response): Promise<void> {
    try {
      const { login, password } = req.body;
      if (!login && !password) {
        res.status(400).json({ message: "wrong credentials" });
        return;
      }

      const user = await UserModel.findOne({
        $or: [{ username: login }, { email: login }],
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

  public static async verifyToken(req: Request, res: Response): Promise<void> {
    res.status(200).json({ message: "access permit granted", data: req.user });
  }

  public static async resetPasswordRequest(
    req: Request,
    res: Response,
  ): Promise<void> {
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

      await sendPasswordResetEmail(
        user.email,
        `${process.env.CLIENT_URL}/reset-password/${resetToken}`,
      );

      res
        .status(200)
        .json({ message: "password reset token generated", resetToken });
    } catch (err) {
      res
        .status(500)
        .json({ message: "server error", error: (err as Error).stack });
    }
  }

  public static async resetPassword(
    req: Request,
    res: Response,
  ): Promise<void> {
    try {
      const { token } = req.params;
      const { password } = req.body;

      if (!token || !password) {
        res.status(400).json({ message: "token and password are required" });
        return;
      }

      const user = await UserModel.findOne({
        resetPasswordToken: token,
        resetPasswordExpiresAt: { $gt: new Date() },
      });
      if (!user) {
        res.status(400).json({ message: "invalid or expired token" });
        return;
      }

      const salt = 10;
      const hashedPassword = await bcrypt.hash(password, salt);

      user.password = hashedPassword;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpiresAt = undefined;

      await user.save();

      await sendPasswordSuccessEmail(user.email);
      res
        .status(200)
        .json({ success: true, message: "password reset successfully" });
    } catch (err) {
      res
        .status(500)
        .json({ message: "server error", error: (err as Error).stack });
    }
  }
}

export default AuthControllers;
