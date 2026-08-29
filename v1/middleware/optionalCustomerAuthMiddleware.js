import jwt from "jsonwebtoken";
import Customer from "../modules/customer/model/customer.model.js";

const optionalCustomerAuthMiddleware = () => {
  return async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader?.startsWith("Bearer ")) {
        req.customer = null;
        req.customerId = null;
        return next();
      }

      const token = authHeader.split(" ")[1];

      if (!token) {
        req.customer = null;
        req.customerId = null;
        return next();
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const customerId =
        decoded.customerId || decoded.customer_id || decoded.id || decoded._id;

      if (!customerId) {
        req.customer = null;
        req.customerId = null;
        return next();
      }

      const customer = await Customer.findById(customerId);

      if (!customer || customer.status !== "active") {
        req.customer = null;
        req.customerId = null;
        return next();
      }

      req.customer = customer;
      req.customerId = customer._id;

      next();
    } catch (error) {
      console.warn("Optional customer authentication failed:", error.message);

      req.customer = null;
      req.customerId = null;

      next();
    }
  };
};

export default optionalCustomerAuthMiddleware;
