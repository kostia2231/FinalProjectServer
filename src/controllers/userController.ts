import validator from "validator";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import UserModel from "../models/User.js";
import "dotenv/config";

class UserControllers {
  public static async getUser(req: Request, res: Response): Promise<void> {
    try {
      const { username } = req.params;
      if (!username) {
        res.status(400).json({ message: "username is required" });
        return;
      }

      const user = await UserModel.findOne({ username }).select("-password");
      //populate to add;

      res.status(200).json({ user });
    } catch (err) {
      console.error(`error fetching user: ${(err as Error).stack}`);
      res.status(500).json({
        message: "server error",
        error: (err as Error).message,
      });
    }
  }

  public static async updateUser(req: Request, res: Response): Promise<void> {
    try {
      const { username } = req.params;

      if (!username || typeof username !== "string") {
        res
          .status(400)
          .json({ message: "username is required and must be a string" });
        return;
      }

      const user = await UserModel.findOne({ username }).select("-password");
      if (!user) {
        res.status(404).json({ message: "user not found" });
        return;
      }

      if (!req.body || Object.keys(req.body).length === 0) {
        res.status(400).json({ message: "Request body cannot be empty" });
        return;
      }

      const { bio, website, new_username } = req.body;

      if (new_username) {
        const isExists = await UserModel.findOne({
          username: new_username,
          _id: { $ne: user._id },
        });
        if (isExists) {
          res
            .status(400)
            .json({ message: "Invalid new Username. It must be unique." });
          return;
        }
      }

      if (new_username) {
        if (
          typeof new_username !== "string" ||
          !validator.matches(new_username, "^[a-zA-Z0-9_\\.-]*$") ||
          !validator.isLength(new_username, { max: 20 })
        ) {
          res.status(400).json({
            message:
              "Invalid new username. It must be unique, alphanumeric, and less than 20 characters.",
          });
          return;
        }
        user.username = new_username;
      }

      if (bio) {
        if (typeof bio !== "string" || !validator.isLength(bio, { max: 150 })) {
          res.status(400).json({
            message:
              "Invalid bio. It must be a string and less than 150 characters.",
          });
          return;
        }
        user.bio = bio;
      }

      if (website) {
        if (
          typeof website !== "string" ||
          !validator.isURL(website) ||
          !validator.isLength(website, { max: 120 })
        ) {
          res.status(400).json({
            message:
              "Invalid website. It must be a valid URL and less than 120 characters.",
          });
          return;
        }
        user.website = website;
      }

      await user.save();

      const updatedToken = jwt.sign(
        { id: user._id, username: user.username, email: user.email },
        process.env.JWT_SECRET as string,
        { expiresIn: "6h" },
      );

      res.status(200).json({
        message: "user updated successfully",
        user,
        token: updatedToken,
      });
    } catch (err) {
      console.error(`error updating user: ${(err as Error).stack}`);
      res.status(500).json({
        message: "internal server error",
        error: (err as Error).message,
      });
    }
  }

  public static async searchUser(_req: Request, res: Response): Promise<void> {
    try {
      const users = await UserModel.find({}, "username profileImg");
      if (users.length === 0) {
        res.status(404).json({ message: "users not found" });
        return;
      }

      res.status(200).json({ users });
    } catch (err) {
      console.error(`error fetching users: ${(err as Error).stack}`);
      res.status(500).json({
        message: "server error",
        error: (err as Error).message,
      });
    }
  }
}

export default UserControllers;
