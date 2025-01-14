import { Request, Response, NextFunction } from "express";
import multer, { FileFilterCallback } from "multer";

const storage = multer.memoryStorage();

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  callback: FileFilterCallback,
): void => {
  const allowedMimeTypes = ["image/png", "image/jpg", "image/jpeg"];

  if (allowedMimeTypes.includes(file.mimetype)) {
    callback(null, true);
  } else {
    callback(
      new Error(
        "invalid file type. only PNG, JPG, and JPEG are allowed",
      ) as any,
      false,
    );
  }
};

const upload = multer({
  storage,
  fileFilter,
}).array("images", 5);

export const uploadMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  upload(req, res, (err) => {
    if (err) {
      return res
        .status(400)
        .json({ message: "error while uploading files", error: err.message });
    }
    next();
  });
};
