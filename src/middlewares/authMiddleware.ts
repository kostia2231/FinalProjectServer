import jwt from "jsonwebtoken";
import { Response, Request, NextFunction } from "express";
import { TokenPayload } from "../types/express.js";

export function isAuthenticated(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res
      .status(401)
      .json({ message: "authorization header is required or wrong format" });
    return;
  }

  const token = authHeader.split(" ")[1];

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error("JWT secret key is missing");
    res.status(500).json({ message: "Internal server error" });
    return;
  }

  jwt.verify(token, secret, (err, decoded) => {
    if (err) {
      console.error(`JWT verification failed: ${(err as Error).message}`);
      res.status(403).json({ message: "invalid or expired token" });
      return;
    }

    req.user = decoded as TokenPayload;
    next();
  });
}
