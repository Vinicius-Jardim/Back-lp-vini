import { decodeToken } from "../utils/tokenUtil.js";
import { HttpStatus } from "../utils/httpStatus.js";
import { roleHierarchy } from "../models/usersModel.js";

const authorize = (requiredRole) => {
  return async (req, res, next) => {
    try {
      const authorize = req.header("authorization");
      const token = authorize && authorize.split(" ")[1];

      if (!token) {
        return res
          .status(HttpStatus.UNAUTHORIZED)
          .json({ message: "Access denied. Token not provided." });
      }      // Decode the token
      const decoded = await decodeToken(token);
      const userRole = decoded.role;

      if (!userRole) {
        return res
          .status(HttpStatus.UNAUTHORIZED)
          .json({ message: "User role not found in token." });
      }

      // Check if the user has the required role by comparing with roleHierarchy
      if (roleHierarchy[userRole] >= roleHierarchy[requiredRole]) {
        return next(); // Authorized
      } else {
        return res
          .status(HttpStatus.FORBIDDEN)
          .json({ message: "Permission denied. Insufficient role." });
      }
    } catch (error) {
      // Handle token decoding errors or others
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: error });
    }
  };
};

export default authorize;
