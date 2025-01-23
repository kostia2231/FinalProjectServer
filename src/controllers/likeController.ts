import { Request, Response } from "express";
import { Types } from "mongoose";
import LikeModel from "../models/Like.js";
import PostModel from "../models/Post.js";
import NotificationModel from "../models/Notification.js";
import UserModel from "../models/User.js";

class LikeController {
  public static async like(req: Request, res: Response): Promise<void> {
    try {
      const { postId } = req.params;
      const userId = req.user?.id;

      if (!postId) {
        res.status(400).json({ message: "post id is required" });
        return;
      }

      if (!userId) {
        res.status(401).json({ message: "authentication faild" });
        return;
      }

      const user = await UserModel.findById(userId).select(
        "username profileImg",
      );

      if (!user) {
        res.status(404).json({ message: "user not found" });
        return;
      }

      const post = await PostModel.findById(postId);
      if (!post) {
        res.status(404).json({ message: "post not found" });
        return;
      }

      const isLikeExists = await LikeModel.exists({ postId, userId });
      if (isLikeExists) {
        res.status(400).json({ message: "you already liked this" });
        return;
      }

      const like = new LikeModel({ postId, userId });
      await like.save();

      post.likes.push(like._id as Types.ObjectId);
      post.likesCount += 1;
      await post.save();

      await NotificationModel.create({
        userId: post.userId,
        senderId: userId,
        senderUsername: user.username,
        senderProfileImg: user.profileImg || "",
        type: "liked your post",
        postId,
        postImg: post.imgUrls[0],
        isRead: false,
      });

      res.status(200).json({ message: "liked successfully", like });
    } catch (err) {
      res.status(500).json({
        message: "error liking post",
        error: (err as Error).message,
      });
    }
  }

  public static async unlike(req: Request, res: Response): Promise<void> {
    try {
      const { postId } = req.params;
      const userId = req.user?.id;

      if (!postId) {
        res.status(400).json({ message: "post id is required" });
        return;
      }

      if (!userId) {
        res.status(401).json({ message: "authentication faild" });
        return;
      }

      const like = await LikeModel.findOneAndDelete({ postId, userId });
      if (!like) {
        res.status(404).json({ message: "like not found" });
        return;
      }

      const post = await PostModel.findById(postId);
      if (post) {
        post.likes = post.likes.filter(
          (id) => !id.equals(like._id as Types.ObjectId),
        );
        post.likesCount = Math.max(post.likesCount - 1, 0);
        await post.save();
      }

      res.status(200).json({ message: "unliked successfully" });
    } catch (err) {
      res.status(500).json({
        message: "error unliking post",
        error: (err as Error).message,
      });
    }
  }

  public static async checkLikeStatus(
    req: Request,
    res: Response,
  ): Promise<void> {
    try {
      const { postId } = req.params;
      const userId = req.user?.id;

      if (!postId || !userId) {
        res.status(400).json({ message: "postId and userId are required" });
        return;
      }

      const like = await LikeModel.findOne({ postId, userId });
      if (like) {
        res.status(200).json({ isLiked: true });
        return;
      } else {
        res.status(200).json({ isLiked: false });
        return;
      }
    } catch (err) {
      res.status(500).json({
        message: "error checking like status",
        error: (err as Error).message,
      });
    }
  }
}

export default LikeController;
