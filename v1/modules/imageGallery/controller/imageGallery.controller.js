import {
  createImageGalleryService,
  getAllImageGalleryService,
  updateImageGalleryService,
  uploadImageGalleryService,
  deleteImageGalleryService,
} from "../service/imageGallery.service.js";

export const uploadImageGalleryController = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    const { url, publicId } = await uploadImageGalleryService(req.file);

    return res.status(200).json({
      success: true,
      message: "Image uploaded successfully",
      data: {
        url,
        publicId,
      },
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      success: false,
      message: error.message,
    });
  }
};

export const createImageGalleryController = async (req, res) => {
  try {
    const imageGallery = await createImageGalleryService(req.body);

    return res.status(201).json({
      success: true,
      message: "Image Gallery created successfully",
      data: imageGallery,
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAllImageGalleryController = async (req, res) => {
  try {
    const imageGallery = await getAllImageGalleryService();

    return res.status(200).json({
      success: true,
      data: imageGallery,
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateImageGalleryController = async (req, res) => {
  try {
    const { id } = req.params;

    const imageGallery = await updateImageGalleryService(id, req.body);

    return res.status(200).json({
      success: true,
      message: "Image Gallery updated successfully",
      data: imageGallery,
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      success: false,
      message: error.message,
    });
  }
};
export const deleteImageGalleryController = async (req, res) => {
  try {
    const { id } = req.params;

    await deleteImageGalleryService(id);

    return res.status(200).json({
      success: true,
      message: "Image Gallery deleted successfully",
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      success: false,
      message: error.message,
    });
  }
};
