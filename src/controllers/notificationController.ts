import { Request, Response } from "express";
import UserModel from "../models/User.js";
import NotificationModel from "../models/Notification.js";

class NotificationController {
  public static async createNotification(
    req: Request,
    res: Response,
  ): Promise<void> {
    try {
      const { userId, type, postId, commentId } = req.body;
      const senderId = req.user?.id;

      if (!senderId) {
        res.status(400).json({ message: "you dont have rights to do this" });
        return;
      }

      if (!userId || !type) {
        res.status(400).json({ message: "userId and type are required" });
        return;
      }

      const validTypes = [
        "liked your post",
        "liked your comment",
        "commented on your post",
        "started following you",
      ];
      if (!validTypes.includes(type)) {
        res.status(400).json({ message: "invalid notification type" });
        return;
      }

      const recipient = await UserModel.findById(userId).select(
        "username profileImg",
      );
      if (!recipient) {
        res.status(404).json({ message: "recipient not found" });
        return;
      }

      const sender = await UserModel.findById(senderId).select(
        "username profileImg",
      );
      if (!sender) {
        res.status(404).json({ message: "sender not found" });
        return;
      }

      const notification = new NotificationModel({
        userId: userId,
        senderId: senderId,
        senderUsername: sender.username,
        senderProfileImg: sender.profileImg,
        type,
        postId: postId || undefined,
        commentId: commentId || undefined,
        isRead: false,
      });

      await notification.save();

      res.status(201).json({
        message: "notification created successfully",
        notification,
      });
    } catch (err) {
      res.status(500).json({
        message: "error creating notification",
        error: (err as Error).message,
      });
    }
  }

  public static async getUserNotifications(
    req: Request,
    res: Response,
  ): Promise<void> {
    try {
      const { userId } = req.params;

      if (!userId) {
        res.status(403).json({ message: "you dont have an access" });
        return;
      }

      const notifications = await NotificationModel.find({
        userId: userId,
      }).sort({ createdAt: -1 });

      res.status(200).json({ notifications });
    } catch (err) {
      res.status(500).json({
        message: "error getting notifications",
        error: (err as Error).message,
      });
    }
  }

  public static async updateNotificationStatus(
    req: Request,
    res: Response,
  ): Promise<void> {
    try {
      const { notificationId } = req.params;

      const notification = await NotificationModel.findById(notificationId);
      if (!notification) {
        res.status(404).json({ message: "notification not found" });
        return;
      }

      notification.isRead = req.body.isRead ?? !notification.isRead;

      await notification.save();

      res
        .status(200)
        .json({ message: "notification has been updated", notification });
    } catch (err) {
      res.status(500).json({
        message: "error updating notification",
        error: (err as Error).message,
      });
    }
  }

  public static async deleteNotification(
    req: Request,
    res: Response,
  ): Promise<void> {
    try {
      const { notificationId } = req.params;

      if (!notificationId) {
        res.status(400).json({ message: "notificationId is required" });
        return;
      }

      const notification =
        await NotificationModel.findByIdAndDelete(notificationId);

      if (!notification) {
        res.status(404).json({ message: "notification not found" });
        return;
      }

      res.status(200).json({ message: "notification deleted successfully" });
    } catch (err) {
      res.status(500).json({
        message: "error deleting notification",
        error: (err as Error).message,
      });
    }
  }
}

export default NotificationController;
