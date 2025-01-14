import axios from "axios";
import FormData from "form-data";
import { Readable } from "stream";
import "dotenv/config";

class FileUploader {
  public static async uploadToCloudinary(
    buffer: Buffer,
    resourceType: "image" | "video",
  ): Promise<string | unknown> {
    const formData = new FormData();
    formData.append("file", Readable.from(buffer), "file-name");
    formData.append("resource_type", resourceType);
    formData.append("upload_preset", "your-upload-preset");

    const uploadUrl = `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/upload`;

    try {
      const response = await axios.post(uploadUrl, formData, {
        headers: formData.getHeaders(),
        auth: {
          username: String(process.env.CLOUDINARY_API_KEY),
          password: String(process.env.CLOUDINARY_API_SECRET),
        },
      });

      if (response.data && response.data.secure_url) {
        return response.data.secure_url;
      } else {
        throw new Error("Cloudinary response is missing or empty secure_url");
      }
    } catch (err) {
      console.error("Error during Cloudinary upload:", (err as Error).message);
      throw new Error("Failed to upload file to Cloudinary");
    }
  }

  public static async deleteFromCloudinary(publicId: string): Promise<void> {
    const deleteUrl = `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/delete_resources`;

    try {
      const response = await axios.post(
        deleteUrl,
        { public_ids: [publicId] },
        {
          auth: {
            username: String(process.env.CLOUDINARY_API_KEY),
            password: String(process.env.CLOUDINARY_API_SECRET),
          },
        },
      );

      if (
        response.data &&
        response.data.deleted &&
        response.data.deleted[publicId] === "deleted"
      ) {
        console.log(
          `File with public ID ${publicId} has been deleted from Cloudinary.`,
        );
      } else {
        throw new Error(
          `Failed to delete file from Cloudinary: ${response.data.error}`,
        );
      }
    } catch (err) {
      console.error(
        "Error during Cloudinary deletion:",
        (err as Error).message,
      );
      throw new Error("Failed to delete file from Cloudinary");
    }
  }
}

export default FileUploader;
