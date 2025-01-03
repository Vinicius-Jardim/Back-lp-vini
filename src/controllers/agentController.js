import { HttpStatus } from "../utils/httpStatus.js";

export class AgentController {
  constructor(agentService) {
    this.agentService = agentService;
  }

  getProperties = async (req, res) => {
    try {
      const data = req.user;
      const properties = await this.agentService.getProperties(data);
      res.status(HttpStatus.OK).json(properties);
    } catch (error) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ error: error.message });
    }
  };
}
