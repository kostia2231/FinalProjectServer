import { Router } from "express";
import SubscriptionController from "../controllers/subscriptionController.js";
import { isAuthenticated } from "../middlewares/authMiddleware.js";

const subscriptionRouter = Router();

subscriptionRouter.post(
  "/follow/:userId",
  isAuthenticated,
  SubscriptionController.follow,
);

subscriptionRouter.post(
  "/unfollow/:userId",
  isAuthenticated,
  SubscriptionController.unfollow,
);

subscriptionRouter.get(
  "/user/:userId/followers",
  isAuthenticated,
  SubscriptionController.getFollowers,
);

subscriptionRouter.get(
  "/user/:userId/following",
  isAuthenticated,
  SubscriptionController.getFollowing,
);

export default subscriptionRouter;
