import { Router } from "express";
import { upload } from "../../middlewares/uploadImage.js";
import { UserController } from "../../controllers/userController.js";
import { UserService } from "../../services/controllers/userService.js";
import { verifyToken } from "../../middlewares/verifyToken.js";
import authorize from "../../middlewares/authorize.js";
import { roles } from "../../models/usersModel.js";
import { UserValidator } from "../../validators/userValidator.js";
import { saveFilePath } from "../../middlewares/uploadImage.js";
import { checkUserExists } from "../../middlewares/checkUser.js";

const router = Router();
const userService = new UserService();
const userController = new UserController(userService);

// ==========================PUBLIC ROUTES==========================

//Register a new user
router.post("/register", UserValidator.register(), userController.register);

//Login user
router.post("/login", UserValidator.login(), userController.login);

router.get(
  "/get-all-agents",
  UserValidator.getAllAgents(),
  userController.getAllAgents
);

router.get(
  "/agents-by-enterprise",
  UserValidator.getAgentsbyEnterprise(),
  userController.getAgentsbyEnterprise
);

//Forgot password token
router.get(
  "/forgot-password-email",
  UserValidator.forgotPasswordToken(),
  userController.forgotPasswordToken
);

//Get user by id
router.get(
  "/user-by-id/:id",
  UserValidator.userById(),
  userController.userById
);

//Forgot password
router.post(
  "/forgot-password/:token",
  verifyToken,
  UserValidator.forgotPassword(),
  userController.forgotPassword
); //???

// ==========================PRIVATE ROUTES==========================

//Get user information
router.get(
  "/me",
  verifyToken,
  checkUserExists,
  authorize(roles.CLIENT),
  userController.me
);

//Update user information
router.put(
  "/update",
  verifyToken,
  checkUserExists,
  authorize(roles.CLIENT),
  UserValidator.updateUser(),
  upload,
  saveFilePath,
  userController.updateUser
);

//Delete user falta fazer
router.delete(
  "/delete-account",
  verifyToken,
  checkUserExists,
  authorize(roles.CLIENT),
  userController.deleteUser
);

export default router;
