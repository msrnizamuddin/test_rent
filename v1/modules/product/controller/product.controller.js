import Product from "../model/product.model.js";

export const createProduct = async (req, res) => {
  try {
    // const tenantId = req.user?.tenantId;
    // const createdBy = req.user?._id;
    const tenantId = req.body.tenantId || "dummy-tenant-uuid-12345";
    const createdBy = req.body.createdBy || null;

    if (!tenantId) {
      return res.status(401).json({
        success: false,
        message: "No tenantId found in the request",
      });
    }

    if (!req.body.productName || !req.body.productSlug) {
      return res.status(400).json({
        success: false,
        message: "Product name and slug are required"
      });
    }

    const productData = {
      ...req.body,
      tenantId: tenantId,
      createdBy: createdBy,
      updatedBy: createdBy,
    };

    const newProduct = new Product(productData);
    const savedProduct = await newProduct.save();

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: savedProduct
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Product with this slug already exists",
      });
    }

    console.error("Internal server error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const getAllProducts = async (req, res) => {
  try {
    // const tenantId = req.user?.tenantId;
    const tenantId = req.body?.tenantId || req.query?.tenantId || "my-company-uuid-001";

    if (!tenantId) {
      return res.status(401).json({
        success: false,
        message: "No tenantId found in the request",
      });
    }

    const products = await Product.find({
      tenantId: tenantId,
      centralStatus: "active",
    })
      .populate("productBrand", "name slug")
      .populate("productCategory", "name slug")
      .sort({ createdAt: -1 })  // newest first

    return res.status(200).json({
      success: true,
      count: products.length,
      message: "Products fetched successfully",
      data: products
    });

  } catch (error) {
    console.error("Error fetching products:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const updateProduct = async (req, res) => {
  try {
    console.log("Incoming Update Data from Postman:", req.body);
    const productId = req.params.id;
    // const tenantId = req.user?.tenantId;
    // const updatedBy = req.user?._id;
    const tenantId = req.body?.tenantId || req.query?.tenantId || "my-company-uuid-001";
    const updatedBy = req.body?.updatedBy || null;

    if (!tenantId) {
      return res.status(401).json({
        success: false,
        message: "No tenantId found in the request",
      });
    }
    const updateData = {
      ...req.body,
      updatedBy: updatedBy,
    };

    delete updateData.tenantId;
    delete updateData.createdBy;
    console.log("Data going to MongoDB:", updateData);

    const updatedProduct = await Product.findByIdAndUpdate(
      {
        _id: productId,
        tenantId: tenantId
      },
      {
        $set: updateData
      },
      {
        new: true,
        runValidators: true
      }
    ).populate("productBrand productCategory");

    if (!updatedProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found or you don't have permission to update."
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: updatedProduct,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Product with this slug already exists",
      });
    }

    console.error("Internal server error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};