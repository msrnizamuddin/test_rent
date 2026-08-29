import cloudinary from "./client.js";

export const deleteFile = async (publicId) => {
  if (!publicId) {
    throw new Error("Cloudinary public ID is required.");
  }

  const result = await cloudinary.uploader.destroy(publicId, {
    resource_type: "image",
  });

  if (result.result !== "ok" && result.result !== "not found") {
    throw new Error(`Failed to delete image: ${result.result}`);
  }

  return result;
};
