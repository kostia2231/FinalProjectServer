import { Schema, model, Document } from "mongoose";

interface IUser extends Document {
  username: string;
  email: string;
  fullName: string;
  password: string;
  createdAt: NativeDate;
  updatedAt: NativeDate;
}

const UserSchema = new Schema<IUser>(
  {
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true },
    fullName: { type: String, required: true, trim: true },
    password: { type: String, required: true, trim: true },
  },
  { timestamps: true },
);

const UserModel = model("User", UserSchema);
export default UserModel;
