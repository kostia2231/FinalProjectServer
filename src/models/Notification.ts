import { Schema, model, Types } from "mongoose";

const NotificationSchema = new Schema({
  user: { type: Types.ObjectId, required: true, ref: "User" },
  actionMaker: { type: Types.ObjectId, required: true, ref: "User" },
  post: { type: Types.ObjectId, ref: "Post" },
  comment: { type: Types.ObjectId, ref: "Comment" },
  createdAt: { type: Date, default: Date.now },
  type: {
    type: String,
    required: true,
    enum: [
      "liked your post",
      "liked your comment",
      "commented on your post",
      "started following you",
    ],
  },
});

const NotificationModel = model("Notification", NotificationSchema);
export default NotificationModel;
