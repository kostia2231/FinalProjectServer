import { cloudinary } from "../config/cloudinary.js";

export class FileUploader {
  public static async uploadToCloudinary(
    buffer: Buffer,
    resourceType: "image" | "video",
  ): Promise<string | undefined> {
    try {
      const uploadUrl = await new Promise<string | undefined>(
        (resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            { resource_type: resourceType },
            (error, result) => {
              if (error) {
                console.error("cloudinary upload error:", error);
                reject(new Error("error uploading to Cloudinary"));
              } else if (
                !result?.secure_url ||
                result.secure_url.trim() === ""
              ) {
                reject(
                  new Error(
                    "cloudinary response is missing or empty secure_url",
                  ),
                );
              } else {
                console.log("cloudinary upload success:", result.secure_url);
                resolve(result.secure_url);
              }
            },
          );
          uploadStream.end(buffer);
        },
      );

      return uploadUrl;
    } catch (error) {
      console.error("error during Cloudinary upload:", error);
      throw new Error("failed to upload file to Cloudinary");
    }
  }
  public static async deleteFromCloudinary(publicId: string): Promise<void> {
    try {
      const result = await cloudinary.uploader.destroy(publicId);
      if (result.result === "ok") {
        console.log(
          `File with public ID ${publicId} has been deleted from Cloudinary.`,
        );
      } else {
        console.error(
          `Error deleting file with public ID ${publicId}: ${result.error}`,
        );
        throw new Error(
          `Failed to delete file from Cloudinary: ${result.error}`,
        );
      }
    } catch (error) {
      console.error("Error during Cloudinary deletion:", error);
      throw new Error("Failed to delete file from Cloudinary");
    }
  }
}
