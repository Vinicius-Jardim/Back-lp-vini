import { Router } from "express";
import { verifyToken } from "../../middlewares/verifyToken.js";
import authorize from "../../middlewares/authorize.js";
import { roles } from "../../models/usersModel.js";
import { checkUserExists } from "../../middlewares/checkUser.js";
import { upload } from "../../middlewares/uploadImage.js";
import { saveFilePath } from "../../middlewares/uploadImage.js";
import { PropertyService } from "../../services/controllers/propertyService.js";
import { PropertyController } from "../../controllers/propertyController.js";
import { PropertyValidator } from "../../validators/propertyValidator.js";

const router = Router();
const propertyService = new PropertyService();
const propertyController = new PropertyController(propertyService);

// ==========================PUBLIC ROUTES==========================

// Get all properties
router.get("/all/", propertyController.allProperties);

// Get property by id
router.get(
  "/by-id/:id",
  PropertyValidator.getPropertyByIdValidation,
  propertyController.getPropertyById
);

router.get(
  "/agent/:id",
  PropertyValidator.getAgentPropertiesValidation,
  propertyController.getAgentProperties
);

router.get("/new-releases", propertyController.newReleases);

// Get nearby properties
router.get(
  "/nearby",
  PropertyValidator.getNearbyPropertiesValidation,
  propertyController.getNearbyProperties
);

// ==========================AGENT ROUTES==========================

// Create a new Property
router.post(
  "/add",
  verifyToken,
  checkUserExists,
  authorize(roles.AGENT),
  upload,
  saveFilePath,
  PropertyValidator.addPropertyValidation,
  propertyController.addProperty
);

// Update a Property
router.put(
  "/update/:id",
  verifyToken,
  checkUserExists,
  authorize(roles.AGENT),
  upload,
  saveFilePath,
  PropertyValidator.updatePropertyValidation,
  propertyController.updateProperty
);

// Delete a Property
router.delete(
  "/delete/:id",
  verifyToken,
  checkUserExists,
  authorize(roles.AGENT),
  PropertyValidator.deletePropertyValidation,
  propertyController.deleteProperty
);

router.put(
  "/reserve/:id",
  verifyToken,
  checkUserExists,
  authorize(roles.AGENT),
  PropertyValidator.reservePropertyValidation,
  propertyController.reserveProperty
);

// ==========================ADMIN ROUTES==========================

// Get sold properties
router.get(
  "/sold/",
  verifyToken,
  checkUserExists,
  authorize(roles.ADMIN),
  PropertyValidator.getSoldPropertiesValidation,
  propertyController.getSoldProperties
);
export default router;
