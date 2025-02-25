import { Request, Response } from "express";
import LikeModel from "../models/Like.js";
import PostModel from "../models/Post.js";
import UserModel from "../models/User.js";
import { FileUploader } from "../utils/imgUploader.js";
import { extractPublicId } from "../utils/extractPublicId.js";

class PostController {
  public static async createPost(
    req: Request<{}, {}, { caption: string }>,
    res: Response,
  ): Promise<void> {
    try {
      const { caption } = req.body;

      if (typeof caption !== "string" || caption.length > 150) {
        res.status(400).json({
          message:
            "max caption length is 150 symbols or caption is not a string",
        });
        return;
      }

      if (!req.user) {
        res.status(401).json({ message: "authentication failed" });
        return;
      }

      if (
        !req.files ||
        Array.isArray(req.files) === false ||
        req.files.length === 0
      ) {
        res
          .status(400)
          .json({ message: "no files uploaded or files are empty" });
        return;
      }

      const uploadPromises = (req.files as Express.Multer.File[]).map((file) =>
        FileUploader.uploadToCloudinary(file.buffer, "image"),
      );

      const imgUrls = await Promise.all(uploadPromises);

      const newPost = new PostModel({
        userId: req.user.id,
        imgUrls: imgUrls,
        caption: caption || "",
      });

      await newPost.save();

      await UserModel.findByIdAndUpdate(req.user.id, {
        $push: { posts: newPost._id },
        $inc: { postsCount: 1 },
      });

      res.status(200).json({ message: "post created successfully", newPost });
    } catch (err) {
      res.status(500).json({
        message: "error creating post",
        error: (err as Error).message,
      });
    }
  }

  public static async getPost(req: Request, res: Response): Promise<void> {
    try {
      const { postId } = req.params;
      if (!postId) {
        res.status(400).json({ message: "postId is required" });
        return;
      }

      const post = await PostModel.findById(postId);
      if (!post) {
        res.status(404).json({ message: "post not found" });
        return;
      }

      res.status(200).json({ message: "post fetched successfully", post });
    } catch (err) {
      res.status(500).json({
        message: "error fetching post",
        error: (err as Error).message,
      });
    }
  }

  public static async getUserPosts(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;

      if (!userId) {
        res.status(400).json({ message: "auth is required" });
        return;
      }

      const posts = await PostModel.find({ userId }).sort({ createdAt: -1 });

      if (!posts) {
        res.status(404).json({ message: "no posts found for this user" });
        return;
      }

      res.status(200).json({ message: "posts fetched successfully", posts });
    } catch (err) {
      res.status(500).json({
        message: "error getting user posts",
        error: (err as Error).message,
      });
    }
  }

  public static async getAllPosts(_req: Request, res: Response): Promise<void> {
    try {
      const posts = await PostModel.find().sort({ createdAt: -1 });

      if (!posts || posts.length === 0) {
        res.status(404).json({ message: "no posts found" });
        return;
      }

      res.status(200).json({ message: "posts fetched successfully", posts });
    } catch (err) {
      res.status(500).json({
        message: "error getting posts",
        error: (err as Error).message,
      });
    }
  }

  public static async getFollowingPosts(
    req: Request,
    res: Response,
  ): Promise<void> {
    try {
      const { userId } = req.params;

      if (!userId) {
        res.status(401).json({ message: "authentication failed" });
        return;
      }

      const user = await UserModel.findById(userId).populate("following");
      if (!user) {
        res.status(404).json({ message: "user not found" });
        return;
      }

      const followingIds = user.following.map((following) => following._id);

      const posts = await PostModel.find({
        userId: { $in: followingIds },
      })
        .populate({
          path: "userId",
          select: "profileImg username _id",
        })
        .sort({ createdAt: -1 });

      if (!posts || posts.length === 0) {
        res.status(404).json({ message: "no posts found from followed users" });
        return;
      }

      const postsWithLikes = await Promise.all(
        posts.map(async (post) => {
          const isLiked = await LikeModel.exists({
            postId: post._id,
            userId,
          });
          return {
            ...post.toObject(),
            user: post.userId,
            userId: undefined,
            isLiked: !!isLiked,
          };
        }),
      );

      res.status(200).json({
        message: "posts fetched successfully",
        posts: postsWithLikes,
      });
    } catch (err) {
      res.status(500).json({
        message: "error fetching posts from followed users",
        error: (err as Error).message,
      });
    }
  }

  public static async editPost(req: Request, res: Response): Promise<void> {
    try {
      const { postId } = req.params;
      const userId = req.user?.id;
      const { caption } = req.body;
      const post = await PostModel.findById(postId);

      if (!postId || !userId) {
        res.status(401).json({ message: "authentication failed" });
        return;
      }

      if (!post) {
        res.status(404).json({ message: "post not found" });
        return;
      }

      if (post.userId.toString() !== userId.toString()) {
        res
          .status(403)
          .json({ message: "you are not authorized to edit this post" });
        return;
      }

      if (caption) post.caption = caption;

      await post.save();

      res.status(200).json({ message: "post edited successfully", post });
    } catch (err) {
      res.status(500).json({
        message: "error creating post",
        error: (err as Error).message,
      });
    }
  }

  public static async deletePost(req: Request, res: Response): Promise<void> {
    try {
      const { postId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ message: "authentication failed" });
        return;
      }

      const post = await PostModel.findById(postId);

      if (!post) {
        res.status(404).json({ message: "post not found" });
        return;
      }

      if (post.userId.toString() !== userId.toString()) {
        res
          .status(403)
          .json({ message: "you are not authorized to edit this post" });
        return;
      }

      if (post.imgUrls && post.imgUrls.length > 0) {
        for (const imageUrl of post.imgUrls) {
          const publicId = extractPublicId(imageUrl);
          if (publicId) {
            await FileUploader.deleteFromCloudinary(publicId);
          }
        }

        await UserModel.findByIdAndUpdate(userId, {
          $inc: { postsCount: -1 },
          $pull: { posts: postId },
        });

        await post.deleteOne();
        res.status(200).json({ message: "post deleted" });
      }
    } catch (err) {
      res.status(500).json({
        message: "error deleting post",
        error: (err as Error).message,
      });
    }
  }
}

export default PostController;
