import { Request, Response } from "express";
import { ObjectId, Types } from "mongoose";
import CommentModel from "../models/Comment.js";
import CommentLikeModel from "../models/CommentLike.js";

class CommentLikeController {
  public static async likeComment(req: Request, res: Response): Promise<void> {
    try {
      const { commentId } = req.params;
      const userId = req.user?.id;

      if (!commentId) {
        res.status(400).json({ message: "comment id is required" });
        return;
      }

      if (!userId) {
        res.status(401).json({ message: "authentication failed" });
        return;
      }

      const comment = await CommentModel.findById(commentId);
      if (!comment) {
        res.status(404).json({ message: "comment not found" });
        return;
      }

      const isLikeExists = await CommentLikeModel.findOne({
        commentId,
        userId,
      });
      if (isLikeExists) {
        res.status(400).json({ message: "you already liked this comment" });
        return;
      }

      const like = new CommentLikeModel({ commentId, userId });
      await like.save();

      comment.likes.push(like._id as Types.ObjectId);
      comment.likesCount += 1;
      await comment.save();

      res.status(200).json({ message: "liked successfully", like });
    } catch (err) {
      res.status(500).json({
        message: "error liking comment",
        error: (err as Error).message,
      });
    }
  }

  public static async unlikeComment(
    req: Request,
    res: Response,
  ): Promise<void> {
    try {
      const { commentId } = req.params;
      const userId = req.user?.id;

      if (!commentId) {
        res.status(400).json({ message: "comment id is required" });
        return;
      }

      if (!userId) {
        res.status(401).json({ message: "authentication failed" });
        return;
      }

      const like = await CommentLikeModel.findOneAndDelete({
        commentId,
        userId,
      });
      if (!like) {
        res.status(404).json({ message: "like not found" });
        return;
      }

      const comment = await CommentModel.findById(commentId);
      if (comment) {
        comment.likes = comment.likes.filter(
          (id) => !id.equals(like._id as Types.ObjectId),
        );
        comment.likesCount = Math.max(comment.likesCount - 1, 0);
        await comment.save();
      }

      res.status(200).json({ message: "unliked successfully" });
    } catch (err) {
      res.status(500).json({
        message: "error unliking comment",
        error: (err as Error).message,
      });
    }
  }

  public static async checkLikeStatus(
    req: Request,
    res: Response,
  ): Promise<void> {
    try {
      const { commentId } = req.params;
      const userId = req.user?.id;

      if (!commentId || !userId) {
        res.status(400).json({ message: "commentId and userId are required" });
        return;
      }

      const like = await CommentLikeModel.findOne({ commentId, userId });
      if (like) {
        res.status(200).json({ isLiked: true });
      } else {
        res.status(200).json({ isLiked: false });
      }
    } catch (err) {
      res.status(500).json({
        message: "error checking like status for comment",
        error: (err as Error).message,
      });
    }
  }
}

export default CommentLikeController;
