import express, { Application } from "express";
import cors from "cors";
import "dotenv/config";

class Server {
  private app: Application;
  private port: number;

  constructor() {
    this.app = express();
    this.port = Number(process.env.PORT) || 8080;
    this.Middlewares();
  }

  private Middlewares() {
    this.app.use(express.json());
    this.app.use(cors());
  }

  public startServer() {
    this.app.listen(this.port, () => {
      console.log(`server runs http://localhost:${this.port}`);
    });
  }
}

const app = new Server();
app.startServer();
