import { Router } from "express";
import { verifyToken } from "../../middlewares/verifyToken.js";
import authorize from "../../middlewares/authorize.js";
import { roles } from "../../models/usersModel.js";
import { AdminValidator } from "../../validators/adminValidator.js";
import { checkUserExists } from "../../middlewares/checkUser.js";
import { AdminController } from "../../controllers/adminController.js";
import { AdminService } from "../../services/controllers/adminService.js";

const router = Router();
const adminService = new AdminService();
const adminController = new AdminController(adminService);

// ==========================ADMIN ROUTES==========================

// Change user role
router.put(
  "/change-role",
  verifyToken,
  checkUserExists,
  authorize(roles.ADMIN),
  AdminValidator.changeRoles(),
  adminController.changeRoles
);

// Get all users
router.get(
  "/all",
  verifyToken,
  checkUserExists,
  authorize(roles.ADMIN),
  AdminValidator.allUsers(),
  adminController.allUsers
);

// Get dashboard data
router.get(
  "/dashboard",
  verifyToken,
  checkUserExists,
  authorize(roles.ADMIN),
  adminController.getDashboard
);

// Create a new user - Não funcional
router.post(
  "/create-user",
  verifyToken,
  checkUserExists,
  authorize(roles.ADMIN),
  AdminValidator.createUser(),
  adminController.createUser
);

router.post(
  "/create-admin",
  verifyToken,
  checkUserExists,
  authorize(roles.ADMIN),
  AdminValidator.createAdmin(),
  adminController.createAdmin
);

// Delete a user
router.delete(
  "/delete-user/:userId",
  verifyToken,
  checkUserExists,
  authorize(roles.ADMIN),
  AdminValidator.deleteUser(),
  adminController.deleteUser
);

//Get user by Id
router.get(
  "/user/:userId",
  verifyToken,
  checkUserExists,
  authorize(roles.ADMIN),
  AdminValidator.getUserById(),
  adminController.getUserById
);

export default router;
