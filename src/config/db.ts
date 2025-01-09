import mongoose from "mongoose";
import "dotenv/config";

const uri: string | undefined = process.env.URI;

const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(uri || "");
    console.log("DB connected successfully");
  } catch (err) {
    console.error(`DB connection failed: ${(err as Error).stack}`);
  }
};

export default connectDB;
