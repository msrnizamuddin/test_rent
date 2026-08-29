import jwt from "jsonwebtoken";
import authModel from "../modules/auth/model/auth.model.js";
import Customer from "../modules/customer/model/customer.model.js";

export const authMiddleware = (...roles) => {
  return async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader?.startsWith("Bearer ")) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized access",
        });
      }

      const token = authHeader.split(" ")[1];

      if (!token) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized access",
        });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      if (!decoded?.id) {
        return res.status(401).json({
          success: false,
          message: "Invalid token",
        });
      }

      const user = await authModel.findById(decoded.id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      const currentRole = user.userType || user.role;

      if (roles.length && !roles.includes(currentRole)) {
        return res.status(403).json({
          success: false,
          message: "Forbidden access",
        });
      }

      req.user = user;

      const customer = await Customer.findOne({
        $or: [{ authId: user._id }, { accountId: user._id }],
      });

      req.customer = customer || null;

      next();
    } catch (error) {
      console.error("Auth middleware error:", error);

      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }
  };
};

export default authMiddleware;
