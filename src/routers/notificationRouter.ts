import NotificationController from "../controllers/notificationController.js";
import { Router } from "express";
import { isAuthenticated } from "../middlewares/authMiddleware.js";

const notificationRouter = Router();

notificationRouter.get(
  "/:userId",
  isAuthenticated,
  NotificationController.getUserNotifications,
);
notificationRouter.post(
  "/create",
  isAuthenticated,
  NotificationController.createNotification,
);
notificationRouter.delete("/delete/:notificationId", isAuthenticated);
notificationRouter.patch(
  "/update/:notificationId",
  isAuthenticated,
  NotificationController.updateNotificationStatus,
);

export default notificationRouter;
