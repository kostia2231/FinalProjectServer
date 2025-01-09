import { Schema, model, Document, Types } from "mongoose";

interface ILike extends Document {
  postId: Types.ObjectId;
  userId: Types.ObjectId;
  createdAt: Date;
}

const LikeSchema = new Schema<ILike>({
  postId: { type: Schema.Types.ObjectId, ref: "Post", required: true },
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now },
});

const LikeModel = model<ILike>("Like", LikeSchema);
export default LikeModel;
