import express, { Application } from "express";
import http from "http";
import { Server as socketServer } from "socket.io";
import cors from "cors";
import connectDB from "./config/db.js";
import authRouter from "./routers/authRouter.js";
import userRouter from "./routers/userRouter.js";
import postRouter from "./routers/postRouter.js";
import commentRouter from "./routers/commentRouter.js";
import subscriptionRouter from "./routers/subscriptionRouter.js";
import likeRouter from "./routers/likeRouter.js";
import commentlikeRouter from "./routers/commentLikeRouter.js";
import notificationRouter from "./routers/notificationRouter.js";
import "dotenv/config";

class Server {
  private app: Application;
  private port: number;
  private httpServer: http.Server;
  private io: socketServer;

  constructor() {
    this.port = Number(process.env.PORT) || 8080;
    this.app = express();
    this.httpServer = http.createServer(this.app);
    this.io = new socketServer(this.httpServer, {
      cors: {
        origin: "*",
      },
    });
    this.Middlewares();
    this.InitDB();
    this.Routes();
    this.SocketHandlers();
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
    this.app.use("/like", likeRouter);
    this.app.use("/comment-like", commentlikeRouter);
    this.app.use("/comment", commentRouter);
    this.app.use("/subscription", subscriptionRouter);
    this.app.use("/notification", notificationRouter);
  }

  private SocketHandlers() {
    //////
  }

  public startServer() {
    this.app.listen(this.port, () => {
      console.log(`server runs http://localhost:${this.port}`);
    });
  }
}

const app = new Server();
app.startServer();
