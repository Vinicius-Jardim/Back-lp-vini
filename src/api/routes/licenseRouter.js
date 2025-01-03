import { Router } from "express";
import { verifyToken } from "../../middlewares/verifyToken.js";
import authorize from "../../middlewares/authorize.js";
import { roles } from "../../models/usersModel.js";
import { checkUserExists } from "../../middlewares/checkUser.js";
import { LicenseController } from "../../controllers/licenseController.js";
import { LicenseValidator } from "../../validators/licenseValidator.js";
import { LicenseService } from "../../services/controllers/licenseService.js";

const router = Router();
const licenseService = new LicenseService();
const licenseController = new LicenseController(licenseService);

// ==========================PUBLIC ROUTES==========================

//Promotion Request
router.post(
  "/promotion-request",
  verifyToken,
  checkUserExists,
  authorize(roles.CLIENT),
  LicenseValidator.licenseRequest(),
  licenseController.licenseRequest
);
// ==========================AGENT ROUTES==========================

//pelo token do usuário, pega a licença do agente
router.get(
  "/own",
  verifyToken,
  checkUserExists,
  authorize(roles.AGENT),
  licenseController.getOwnLicense
);

// ==========================ADMIN ROUTES==========================

router.post(
  "/add",
  verifyToken,
  checkUserExists,
  authorize(roles.ADMIN),
  LicenseValidator.createAgentLicense(),
  licenseController.createAgentLicense
);

router.delete(
  "/delete/:id",
  verifyToken,
  checkUserExists,
  authorize(roles.ADMIN),
  LicenseValidator.deleteLicense(),
  licenseController.deleteLicense
);

router.get(
  "/all",
  verifyToken,
  checkUserExists,
  authorize(roles.ADMIN),
  LicenseValidator.getAllLicenses(),
  licenseController.AllLicenses
);

router.put(
  "/update/:id",
  verifyToken,
  checkUserExists,
  authorize(roles.ADMIN),
  LicenseValidator.updateLicense(),
  licenseController.updateLicense
);

router.get(
  "/by-id/:id",
  verifyToken,
  checkUserExists,
  authorize(roles.ADMIN),
  licenseController.getById
);

router.get(
  "/promotions-requests",
  verifyToken,
  checkUserExists,
  authorize(roles.ADMIN),
  LicenseValidator.getPromotionRequests(),
  licenseController.getPromotionRequests
);

router.put(
  "/promotions-requests/decision/:id",
  verifyToken,
  checkUserExists,
  authorize(roles.ADMIN),
  LicenseValidator.decisionPromotionRequest(),
  licenseController.decisionPromotionRequest
);

export default router;
