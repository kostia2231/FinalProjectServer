import express, { Application } from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import authRouter from "./routers/authRouter.js";
import userRouter from "./routers/userRouter.js";
import postRouter from "./routers/postRouter.js";
import "dotenv/config";

class Server {
  private app: Application;
  private port: number;

  constructor() {
    this.port = Number(process.env.PORT) || 8080;
    this.app = express();
    this.Middlewares();
    this.InitDB();
    this.Routes();
  }

  private Middlewares() {
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
  }

  private async InitDB() {
    try {
      await connectDB();
    } catch (err) {
      console.error(`DB connection failed: ${(err as Error).stack}`);
    }
  }

  private Routes() {
    this.app.use("/auth", authRouter);
    this.app.use("/", userRouter);
    this.app.use("/post", postRouter);
  }

  public startServer() {
    this.app.listen(this.port, () => {
      console.log(`server runs http://localhost:${this.port}`);
    });
  }
}

const app = new Server();
app.startServer();
