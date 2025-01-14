import { Request, Response } from "express";
import PostModel from "../models/Post.js";
import FileUploader from "../utils/imgUploader.js";

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

      if (!req.user || !req.user._id) {
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
        userId: req.user._id,
        imgUrls: imgUrls,
        caption: caption || "",
      });

      await newPost.save();

      res.status(200).json({ message: "post created successfully", newPost });
    } catch (err) {
      res.status(500).json({
        message: "error creating post: ",
        error: (err as Error).message,
      });
    }
  }

  public static async editPost(req: Request, res: Response): Promise<void> {
    try {
      const { postId } = req.params;
      const userId = req.user?._id;
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
        message: "error creating post: ",
        error: (err as Error).message,
      });
    }
  }
}

export default PostController;
