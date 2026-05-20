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

export { createProduct };