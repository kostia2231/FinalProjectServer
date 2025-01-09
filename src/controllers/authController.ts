import UserModel from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Response, Request } from "express";

class AuthControllers {
  public async register(req: Request, res: Response): Promise<void> {
    try {
      const { username, email, password } = req.body;

      if (!username || !email || !password) {
        res.status(400).json({ message: "all fields are required" });
        return;
      }

      const isExists = await UserModel.findOne({
        $or: [{ username }, { email }],
      });
      if (isExists) {
        res.status(400).json({ message: "user already exists" });
        return;
      }

      const salt: number = 10;
      const hashedPassword = await bcrypt.hash(password, salt);

      const newUser = new UserModel({
        username,
        email,
        password: hashedPassword,
      });

      await newUser.save();

      res.status(201).json({ message: "user created successfully" });
      return;
    } catch (err) {
      res
        .status(500)
        .json({ message: "server error", error: (err as Error).stack });
      return;
    }
  }

  public async login(req: Request, res: Response): Promise<void> {
    try {
      const { username, email, password } = req.body;
      if ((!username && !password) || (!email && !password)) {
        res.status(400).json({ message: "wrong credentials" });
        return;
      }

      const user = await UserModel.findOne({
        $or: [{ username }, { email }],
      });
      if (!user) {
        res.status(400).json({ message: "user doesn't exist" });
        return;
      }

      const passwordCorrect = await bcrypt.compare(password, user.password);
      if (!passwordCorrect) {
        res.status(400).json({ message: "wrong credentials" });
        return;
      }

      const token = jwt.sign(
        { id: user._id, username: user.username, email: user.email },
        process.env.JWT_SECRET as string,
        { expiresIn: "6h" },
      );

      res.status(200).json({ messsage: "login successful", token });
      return;
    } catch (err) {
      res
        .status(500)
        .json({ message: "server error", error: (err as Error).stack });
    }
    return;
  }
}

export default AuthControllers;
