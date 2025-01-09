import { Schema, model, Document, Types } from "mongoose";

interface IUser extends Document {
  username: string;
  email: string;
  fullName: string;
  password: string;
  bio: string;
  website: string;
  profile_img: string;
  followersCount: number;
  followers: Types.ObjectId[];
  followingCount: number;
  following: Types.ObjectId[];
  postsCount: number;
  posts: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    fullName: { type: String, required: true },
    password: { type: String, required: true },
    bio: { type: String, default: "" },
    website: { type: String, default: "" },
    profile_img: { type: String, default: "" },
    followersCount: { type: Number, default: 0 },
    followers: [{ type: Schema.Types.ObjectId, ref: "User" }],
    followingCount: { type: Number, default: 0 },
    following: [{ type: Schema.Types.ObjectId, ref: "User" }],
    postsCount: { type: Number, default: 0 },
    posts: [{ type: Schema.Types.ObjectId, ref: "Post" }],
  },
  { timestamps: true },
);

const UserModel = model<IUser>("User", UserSchema);
export default UserModel;
