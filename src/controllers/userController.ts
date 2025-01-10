import validator from "validator";
import { Request, Response } from "express";
import UserModel from "../models/User.js";

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
      if (!username) {
        res.status(400).json({ message: "username is required" });
        return;
      }

      const user = await UserModel.findOne({ username }).select("-password");
      if (!user) {
        res.status(404).json({ message: "user not found" });
        return;
      }

      const { bio, website, new_username } = req.body;

      if (
        new_username &&
        validator.matches(new_username, "^[a-zA-Z0-9_\.\-]*$") &&
        validator.isLength(new_username, { max: 20 }) &&
        new_username !== user.username
      ) {
        const isExists = await UserModel.findOne({ username: new_username });
        if (isExists) {
          res.status(400).json({ message: "username already exists" });
          return;
        }
        user.username = new_username;
      }

      if (bio && validator.isLength(bio, { max: 150 }) && bio !== user.bio) {
        user.bio = bio;
      }

      if (
        website &&
        validator.isLength(website, { max: 120 }) &&
        website !== user.website &&
        validator.isURL(website)
      ) {
        user.website = website;
      }

      await user.save();
      res.status(200).json({ message: "user updated", user });
    } catch (err) {
      console.error(`error editing users: ${(err as Error).stack}`);
      res.status(500).json({
        message: "server error",
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
