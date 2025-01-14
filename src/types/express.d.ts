import express from "express";

export interface TokenPayload {
  username: string;
  _id: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}
