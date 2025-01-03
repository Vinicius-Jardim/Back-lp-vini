import { Property } from "../../models/propertyModel.js";
import { User, roles } from "../../models/usersModel.js";

export class AgentService {
  async getProperties(agentId) {
    const [properties, user] = await Promise.all([
      Property.find({ agent: agentId }),
      User.findOne({ _id: agentId }),
    ]);
    if (user.role === roles.ADMIN) {
      return "Admins cannot have properties";
    }
    if (!properties) {
      throw new Error("No properties found for this agent");
    }
    return properties;
  }
}
