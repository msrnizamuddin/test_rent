import jwt from "jsonwebtoken";
import Customer from "../modules/customer/model/customer.model.js";

const customerAuthMiddleware = () => {
  return async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader?.startsWith("Bearer ")) {
        return res.status(401).json({
          success: false,
          message: "Authentication is required.",
        });
      }

      const token = authHeader.split(" ")[1];

      if (!token) {
        return res.status(401).json({
          success: false,
          message: "Authentication is required.",
        });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const customerId =
        decoded.customerId || decoded.customer_id || decoded.id || decoded._id;

      if (!customerId) {
        return res.status(401).json({
          success: false,
          message: "Invalid customer token.",
        });
      }

      const customer = await Customer.findById(customerId);

      if (!customer) {
        return res.status(401).json({
          success: false,
          message: "Customer not found.",
        });
      }

      if (customer.status !== "active") {
        return res.status(403).json({
          success: false,
          message: "Customer account is inactive.",
        });
      }

      req.customer = customer;
      req.customerId = customer._id;

      next();
    } catch (error) {
      console.error("Customer authentication error:", error);

      return res.status(401).json({
        success: false,
        message: "Invalid or expired customer token.",
      });
    }
  };
};

export default customerAuthMiddleware;
