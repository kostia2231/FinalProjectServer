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

  public static async deleteFromCloudinary(publicIds: string[]): Promise<void> {
    const deleteUrl = `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/delete_resources`;

    try {
      const response = await axios.post(
        deleteUrl,
        { public_ids: publicIds },
        {
          auth: {
            username: String(process.env.CLOUDINARY_API_KEY),
            password: String(process.env.CLOUDINARY_API_SECRET),
          },
        },
      );

      if (response.data && response.data.deleted) {
        publicIds.forEach((id) => {
          if (response.data.deleted[id] === "deleted") {
            console.log(
              `File with public ID ${id} has been deleted from Cloudinary.`,
            );
          } else {
            console.error(
              `Failed to delete file with public ID ${id}: ${response.data.deleted[id]}`,
            );
          }
        });
      } else {
        throw new Error(
          "Failed to delete file from Cloudinary: no deletion status in response.",
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
