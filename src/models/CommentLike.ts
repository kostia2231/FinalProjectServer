import { Schema, model, Document, Types } from "mongoose";

interface ICommentLike extends Document {
  commentId: Types.ObjectId;
  userId: Types.ObjectId;
  createdAt: Date;
}

const CommentLikeSchema = new Schema<ICommentLike>({
  commentId: { type: Schema.Types.ObjectId, ref: "Comment", required: true },
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now },
});

const CommentLikeModel = model<ICommentLike>("CommentLike", CommentLikeSchema);
export default CommentLikeModel;
