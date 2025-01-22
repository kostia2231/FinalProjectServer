import { Request, Response } from "express";
import UserModel from "../models/User.js";
import NotificationModel from "../models/Notification.js";

class NotificationController {
  public static async getUserNotifications(
    req: Request,
    res: Response,
  ): Promise<void> {
    try {
      const { userId } = req.params;

      if (!userId || userId === req.user?.id) {
        res.status(403).json({ message: "you dont have an access" });
        return;
      }

      const notifications = await NotificationModel.find({
        userId: userId,
      }).sort({ createdAt: -1 });

      res.status(200).json({ message: "notifications: ", notifications });
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

      notification.isRead = !notification.isRead;

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
}

export default NotificationController;
