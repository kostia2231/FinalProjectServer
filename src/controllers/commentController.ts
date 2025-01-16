import { Types, startSession } from "mongoose";
import CommentModel from "../models/Comment.js";
import { Request, Response } from "express";
import PostModel from "../models/Post.js";

class CommentController {
  public static async addComment(req: Request, res: Response): Promise<void> {
    const session = await startSession();
    session.startTransaction();

    try {
      const { postId } = req.params;
      const { commentBody, parentCommentId } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
        await session.abortTransaction();
        return;
      }

      const post = await PostModel.findById(postId).session(session);
      if (!post) {
        res.status(404).json({ message: "Post not found" });
        await session.abortTransaction();
        return;
      }

      if (parentCommentId) {
        const parentComment =
          await CommentModel.findById(parentCommentId).session(session);
        if (!parentComment) {
          res.status(404).json({ message: "Parent comment not found" });
          await session.abortTransaction();
          return;
        }
      }

      const comment = new CommentModel({
        userId,
        postId,
        commentBody,
        parentCommentId: parentCommentId || null,
      });

      await comment.save({ session });

      post.comments.push(comment._id as Types.ObjectId);
      post.commentsCount += 1;

      await post.save({ session });

      await session.commitTransaction();
      res.status(201).json({
        message: "Comment added successfully",
        comment,
      });
    } catch (err) {
      await session.abortTransaction();
      res.status(500).json({
        message: "Error creating comment",
        error: (err as Error).message,
      });
    } finally {
      session.endSession();
    }
  }

  public static async deleteComment(
    req: Request,
    res: Response,
  ): Promise<void> {
    const session = await startSession();
    session.startTransaction();

    try {
      const { commentId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ message: "Authorization failed" });
        await session.abortTransaction();
        return;
      }

      const comment = await CommentModel.findById(commentId).session(session);
      if (!comment) {
        res.status(404).json({ message: "Comment not found" });
        await session.abortTransaction();
        return;
      }

      if (comment.userId.toString() !== userId) {
        res.status(403).json({ message: "Ownership check failed" });
        await session.abortTransaction();
        return;
      }

      await CommentModel.deleteMany({ parentCommentId: commentId }).session(
        session,
      );
      await CommentModel.deleteOne({ _id: commentId }).session(session);

      await PostModel.findByIdAndUpdate(
        comment.postId,
        {
          $pull: { comments: commentId },
          $inc: { commentsCount: -1 },
        },
        { session },
      );

      await session.commitTransaction();
      res.status(200).json({ message: "Comment deleted" });
    } catch (err) {
      await session.abortTransaction();
      res.status(500).json({
        message: "Error deleting comment",
        error: (err as Error).message,
      });
    } finally {
      session.endSession();
    }
  }
}

export default CommentController;
