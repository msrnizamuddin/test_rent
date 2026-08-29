import ImageGallery from "../model/imageGallery.model.js";
import tenantGetId from "../../../utils/tenentHalper.js";
import cloudinary from "../../../utils/cloudinary/index.js";

export const uploadImageGalleryService = async (image) => {
  if (!image) {
    throw new Error("No image uploaded.");
  }

  const { url, publicId } = await cloudinary.uploadFile(image);

  return { url, publicId };
};

export const createImageGalleryService = async (payload) => {
  const tenant = await tenantGetId(payload.tenantId);

  if (!tenant) {
    throw new Error("Tenant not found");
  }

  const imageGallery = await ImageGallery.create({
    tenantId: tenant._id,
    centralStatus: payload.centralStatus,
    status: payload.status,
    imageUrl: payload.imageUrl,
    imagePublicId: payload.imagePublicId,
  });

  return imageGallery;
};

export const getAllImageGalleryService = async () => {
  return ImageGallery.find();
};

export const updateImageGalleryService = async (id, payload) => {
  const imageGallery = await ImageGallery.findById(id);

  if (!imageGallery) {
    const err = new Error("ImageGallery not found");
    err.status = 404;
    throw err;
  }

  const oldImagePublicId = imageGallery.imagePublicId;
  const newImagePublicId = payload.imagePublicId;

  Object.assign(imageGallery, payload);

  await imageGallery.save();

  if (
    newImagePublicId &&
    newImagePublicId !== oldImagePublicId &&
    oldImagePublicId
  ) {
    try {
      await cloudinary.deleteFile(oldImagePublicId);
    } catch (error) {
      console.error("Failed to delete old Cloudinary image:", error);
    }
  }

  return imageGallery;
};

export const deleteImageGalleryService = async (id) => {
  const imageGallery = await ImageGallery.findById(id);

  if (!imageGallery) {
    const err = new Error("ImageGallery not found");
    err.status = 404;
    throw err;
  }

  if (imageGallery.imagePublicId) {
    await cloudinary.deleteFile(imageGallery.imagePublicId);
  }

  await ImageGallery.findByIdAndDelete(id);

  return imageGallery;
};
