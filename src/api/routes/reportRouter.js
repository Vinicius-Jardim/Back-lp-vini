import express from "express";
import { verifyToken } from "../../middlewares/verifyToken.js";
import { ReportService } from "../../services/controllers/reportService.js";
import ReportController from "../../controllers/reportController.js";
import authorize from "../../middlewares/authorize.js";
import { ReportValidator } from "../../validators/reportValidator.js";
import { checkUserExists } from "../../middlewares/checkUser.js";
import { roles } from "../../models/usersModel.js";

const router = express.Router();
const reportService = new ReportService();
const reportController = new ReportController(reportService);

// ==========================CLIENT ROUTES==========================

//Get my reports
router.get(
  "/my-reports/",
  verifyToken,
  checkUserExists,
  authorize(roles.CLIENT),
  reportController.getMyReports
);

// ==========================AGENT ROUTES==========================

//Create a report
router.post(
  "/add",
  verifyToken,
  checkUserExists,
  authorize(roles.AGENT),
  ReportValidator.addReport(),
  reportController.addReport
);

// ==========================ADMIN ROUTES==========================

//Delete a report
router.delete(
  "/delete/:id",
  verifyToken,
  checkUserExists,
  authorize(roles.ADMIN),
  ReportValidator.deleteReport(),
  reportController.deleteReport
);

//Get report via id
router.get(
  "/report/:id",
  verifyToken,
  checkUserExists,
  authorize(roles.ADMIN),
  ReportValidator.getReportById(),
  reportController.getReportById
);

//Get report via property id
router.get(
  "/property/",
  verifyToken,
  checkUserExists,
  authorize(roles.ADMIN),
  ReportValidator.getReportById(),
  reportController.getReportByProperty
);

//Get report via agent id
router.get(
  "/agent/",
  verifyToken,
  checkUserExists,
  authorize(roles.ADMIN),
  ReportValidator.getReportById(),
  reportController.getReportByAgent
);

export default router;
