import Product from "../model/product.model.js";

const createProduct = async (req, res) => {
    try {
        const {
            name,
            sku,
            category,
            brand,
            unit,
            barcode,
            images,
            thumbnail,
            pricing,
        } = req.body

        const tenantId = req.user.tenantId;
        // const tenantId = req.body.tenantId || "60d5ecb8b392d71134e9e09b"; for testing without auth

        if (!name || !category || !pricing || !unit) {
            return res.status(400).json({
                success: false,
                message: "Please provide all required fields"
            }); 
        }

        const newProduct = await Product.create({
            tenantId,
            name,
            sku,
            category,
            brand,
            unit,
            barcode,
            images,
            thumbnail,
            pricing,
        });

        return res.status(201).json({
            success: true,
            message: "Product created successfully",
        });

    } catch (error) {
        console.log("Error creating product:", error);

        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: "Product SKU or Barcode already exists",
            });
        }

        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message
        });
    }
};

const getAllProducts = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    //const tenantId = "60d5ecb8b392d71134e9e09b"; // for testing without auth
    const products = await Product.find({ tenantId: tenantId });
    return res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return res.status(500).json({
      success: false,
      message: "An internal server error occurred while fetching the products.",
      error: error.message,
    });
  }
};


const getProductById = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    //const tenantId = "60d5ecb8b392d71134e9e09b"; for testing without auth
    const product = await Product.findOne({ 
      tenantId: tenantId 
    });
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found or you do not have permission to view it.",
      });
    }
    return res.status(200).json({
      success: true,
      data: product,
    });
    
  } catch (error) {
    console.error("Error fetching single product:", error);
    if (error.kind === "ObjectId") {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID format.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "An internal server error occurred while fetching the product.",
      error: error.message,
    });
  }
};


const updateProduct = async (req, res) => {
  try {
 
    const tenantId = req.user.tenantId; 
    //const tenantId = "60d5ecb8b392d71134e9e09b"; for testing without auth
    const updatedProduct = await Product.findOneAndUpdate(
      { tenantId: tenantId }, 
      req.body,               
      { 
        new: true,           
        runValidators: true  
      }
    );
    if (!updatedProduct) {
      return res.status(404).json({
        success: false,
        message: "No products found for this company to update.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product updated successfully!",
      data: updatedProduct,
    });
    
  } catch (error) {
    console.error("Error updating product:", error);
    return res.status(500).json({
      success: false,
      message: "An internal server error occurred while updating the product.",
      error: error.message,
    });
  }
};

export { createProduct, getAllProducts, getProductById, updateProduct };