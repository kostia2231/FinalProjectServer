import { Request, Response } from "express";
import mongoose from "mongoose";
import UserModel from "../models/User.js";
import NotificationModel from "../models/Notification.js";

class SubscriptionController {
  public static async follow(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const currentUserId = req.user?.id;

      if (!userId || !currentUserId || typeof userId !== "string") {
        res
          .status(400)
          .json({ message: "invalid request data or wrong data format" });
        return;
      }

      if (userId === currentUserId) {
        res.status(400).json({ message: "you cannot follow yourself;)" });
        return;
      }

      const userToFollow = await UserModel.findById(userId);
      const currentUser = await UserModel.findById(currentUserId);

      if (!userToFollow || !currentUser) {
        res.status(404).json({ message: "user not found" });
        return;
      }

      const objectIdCurrentUserId = new mongoose.Types.ObjectId(currentUserId);
      const objectIdUserId = new mongoose.Types.ObjectId(userId);

      if (currentUser.following.includes(objectIdUserId)) {
        res.status(200).json({ message: "you already following this user" });
        return;
      }

      currentUser.following.push(objectIdUserId);
      userToFollow.followers.push(objectIdCurrentUserId);

      currentUser.followingCount += 1;
      userToFollow.followersCount += 1;

      await currentUser.save();
      await userToFollow.save();

      await NotificationModel.create({
        userId: objectIdUserId,
        senderId: objectIdCurrentUserId,
        senderUsername: currentUser.username,
        senderProfileImg: currentUser.profileImg || "",
        type: "started following you",
        postId: undefined,
        commentId: undefined,
        isRead: false,
      });

      res.status(200).json({ message: "followed successfully" });
    } catch (err) {
      res.status(500).json({
        message: "error creating post",
        error: (err as Error).message,
      });
    }
  }

  public static async unfollow(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const currentUserId = req.user?.id;

      if (!userId || !currentUserId || typeof userId !== "string") {
        res
          .status(400)
          .json({ message: "invalid request data or wrong data format" });
        return;
      }

      if (userId === currentUserId) {
        res.status(400).json({ message: "you cannot unfollow yourself;)" });
        return;
      }

      const userToUnfollow = await UserModel.findById(userId);
      const currentUser = await UserModel.findById(currentUserId);

      if (!userToUnfollow || !currentUser) {
        res.status(404).json({ message: "user not found" });
        return;
      }

      const objectIdCurrentUserId = new mongoose.Types.ObjectId(currentUserId);
      const objectIdUserId = new mongoose.Types.ObjectId(userId);

      if (!currentUser.following.includes(objectIdUserId)) {
        res.status(400).json({ message: "you are not following this user" });
        return;
      }

      currentUser.following = currentUser.following.filter(
        (id) => !id.equals(objectIdUserId),
      );

      userToUnfollow.followers = userToUnfollow.followers.filter(
        (id) => !id.equals(objectIdCurrentUserId),
      );

      currentUser.followingCount -= 1;
      userToUnfollow.followersCount -= 1;

      await currentUser.save();
      await userToUnfollow.save();

      res.status(200).json({ message: "unfollowed successfully" });
    } catch (err) {
      res.status(500).json({
        message: "error while unfollowing",
        error: (err as Error).message,
      });
    }
  }

  public static async getFollowers(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;

      if (!userId || typeof userId !== "string") {
        res
          .status(400)
          .json({ message: "invalid request data or wrong data format" });
        return;
      }

      const user = await UserModel.findById(userId).populate(
        "followers",
        "_id name profileImg",
      );

      if (!user) {
        res.status(404).json({ message: "user not found" });
        return;
      }

      res.status(200).json({ followers: user.followers });

      if (!user) {
        res.status(404).json({ message: "user not found" });
        return;
      }
    } catch (err) {
      res.status(500).json({
        message: "error while fetching followers",
        error: (err as Error).message,
      });
    }
  }

  public static async getFollowing(req: Request, res: Response): Promise<void> {
    const { userId } = req.params;

    if (!userId || typeof userId !== "string") {
      res
        .status(400)
        .json({ message: "invalid request data or wrong data format" });
      return;
    }

    const user = await UserModel.findById(userId).populate(
      "following",
      "_id name profileImg",
    );

    if (!user) {
      res.status(404).json({ message: "user not found" });
      return;
    }

    res.status(200).json({ following: user.following });

    try {
    } catch (err) {
      res.status(500).json({
        message: "error while fetching following",
        error: (err as Error).message,
      });
    }
  }
}

export default SubscriptionController;
