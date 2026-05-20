const jwt = require("jsonwebtoken");
const authModel = require("../model/auth.model");
const authMiddleware = (...roles) => {
  return async (req, res, next) => {
    try {
      const authHeader =
        req.headers.authorization;

      if (!authHeader) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized access",
        });
      }


      const token =
        authHeader.split(" ")[1];


      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET
      );


      const user = await authModel.findById(
        decoded.id
      );

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      if (
        roles.length &&
        !roles.includes(user.role)
      ) {
        return res.status(403).json({
          success: false,
          message: "Forbidden access",
        });
      }

      req.user = user;

      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }
  };
};

module.exports = authMiddleware;