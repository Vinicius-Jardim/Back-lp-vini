import { Router } from "express";
import { verifyToken } from "../../middlewares/verifyToken.js";
import authorize from "../../middlewares/authorize.js";
import { checkUserExists } from "../../middlewares/checkUser.js";
import { roles } from "../../models/usersModel.js";
import { AgentValidator } from "../../validators/agentValidator.js";
import { AgentService } from "../../services/controllers/agentService.js";
import { AgentController } from "../../controllers/agentController.js";

const router = Router();
const agentService = new AgentService();
const agentController = new AgentController(agentService);
// ==========================AGENT ROUTES==========================

router.get(
  "/own-properties",
  verifyToken,
  checkUserExists,
  authorize(roles.AGENT),
  AgentValidator.getProperties(),
  agentController.getProperties
);

export default router;
