import { Schema, model, Document, Types } from "mongoose";

interface IPost extends Document {
  userId: Types.ObjectId;
  imgUrls: string[];
  caption: string;
  likesCount: number;
  likes: Types.ObjectId[];
  commentsCount: number;
  comments: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const PostSchema = new Schema<IPost>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    imgUrls: [{ type: String, required: true }],
    caption: { type: String, default: "" },
    likesCount: { type: Number, default: 0 },
    likes: [{ type: Schema.Types.ObjectId, ref: "Like", required: true }],
    commentsCount: { type: Number, default: 0 },
    comments: [{ type: Schema.Types.ObjectId, ref: "Comment", required: true }],
  },
  { timestamps: true },
);

const PostModel = model<IPost>("Post", PostSchema);
export default PostModel;
