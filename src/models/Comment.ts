import { Schema, model, Document, Types } from "mongoose";

interface IComment extends Document {
  postId: Types.ObjectId;
  userId: Types.ObjectId;
  likesCount: number;
  likes: Types.ObjectId[];
  commentBody: string;
  parentCommentId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema = new Schema<IComment>(
  {
    postId: { type: Schema.Types.ObjectId, ref: "Post", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    commentBody: { type: String, required: true },
    likesCount: { type: Number, default: 0 },
    likes: [{ type: Schema.Types.ObjectId, ref: "CommentLike" }],
    parentCommentId: {
      type: Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
    },
  },
  { timestamps: true },
);

const CommentModel = model<IComment>("Comment", CommentSchema);
export default CommentModel;
