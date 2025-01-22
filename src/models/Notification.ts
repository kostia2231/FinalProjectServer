import { Schema, model, Types, Document } from "mongoose";

export interface INotification extends Document {
  user: Types.ObjectId;
  actionMaker: Types.ObjectId;
  post?: Types.ObjectId;
  comment?: Types.ObjectId;
  createdAt: Date;
  isRead: boolean;
  type:
    | "liked your post"
    | "liked your comment"
    | "commented on your post"
    | "started following you";
}

const NotificationSchema = new Schema<INotification>({
  user: { type: Schema.Types.ObjectId, required: true, ref: "User" },
  actionMaker: { type: Schema.Types.ObjectId, required: true, ref: "User" },
  post: { type: Schema.Types.ObjectId, ref: "Post" },
  comment: { type: Schema.Types.ObjectId, ref: "Comment" },
  createdAt: { type: Date, default: Date.now },
  isRead: { type: Boolean, default: false },
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

const NotificationModel = model<INotification>(
  "Notification",
  NotificationSchema,
);
export default NotificationModel;
