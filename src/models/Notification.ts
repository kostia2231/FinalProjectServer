import { Schema, model, Types, Document } from "mongoose";

export interface INotification extends Document {
  userId: Types.ObjectId;
  senderId: Types.ObjectId;
  senderUsername: string;
  senderProfileImg?: string;
  postId?: Types.ObjectId;
  commentId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  isRead: boolean;
  type:
    | "liked your post"
    | "liked your comment"
    | "commented on your post"
    | "started following you";
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, required: true, ref: "User" },
    senderId: { type: Schema.Types.ObjectId, required: true, ref: "User" },
    senderUsername: { type: String, required: true },
    senderProfileImg: { type: String },
    postId: { type: Schema.Types.ObjectId, ref: "Post" },
    commentId: { type: Schema.Types.ObjectId, ref: "Comment" },
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
  },
  { timestamps: true },
);

const NotificationModel = model<INotification>(
  "Notification",
  NotificationSchema,
);
export default NotificationModel;
