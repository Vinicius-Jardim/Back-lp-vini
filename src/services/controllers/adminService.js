import { roles, User } from "../../models/usersModel.js";
import { Property } from "../../models/propertyModel.js";
import { dataRole } from "../../utils/dataUtil.js";
import { Report } from "../../models/reportModel.js";
import { AgentLicense } from "../../models/agentLicenseModel.js";
import { createPassword } from "../../utils/passwordUtil.js";

export class AdminService {
  async changeRoles(data) {
    try {
      const userId = data.userId;
      const user = await User.findOne({ _id: userId });

      const newRole = data.newRole;
      if (newRole === user.role) {
        return "User already has this role";
      }

      user.role = newRole;
      await user.save();
      return "Role changed successfully";
    } catch (error) {
      throw new Error("Problem in changing roles " + error);
    }
  }

  async getDashboardData() {
    //Mudar muita coisa aqui
    try {
      const [
        totalUsers,
        totalClientes,
        totalAgentes,
        totalAdmins,
        totalProperties,
        totalReports,
        totalAgentLicenses,
      ] = await Promise.all([
        User.countDocuments(),
        User.countDocuments({ role: roles.CLIENT }),
        User.countDocuments({ role: roles.AGENT }),
        User.countDocuments({ role: roles.ADMIN }),
        Property.countDocuments(),
        Report.countDocuments(),
        AgentLicense.countDocuments(),
      ]);

      return {
        totalUsers,
        totalProperties,
        totalClientes,
        totalReports,
        totalAgentLicenses,
        totalAgentes,
        totalAdmins,
      };
    } catch (error) {
      throw new Error("Problem in fetching dashboard data " + error);
    }
  }

  //Sem uso
  async createUser(userData) {
    //Mudar muita coisa aqui
    const newUser = new User(userData);
    await newUser.save();
    return newUser;
  }

  async deleteUser(userId) {
    try {
      const result = await User.deleteOne({ _id: userId });
      if (result.deletedCount === 0) {
        throw new Error("User not found");
      }
      return "User deleted successfully";
    } catch (error) {
      throw new Error("Problem in deleting user " + error);
    }
  }

  async getUser(data) {
    try {
      const userId = data.userId;
      const payload = dataRole(userId);
      if (!payload) {
        return "User not found";
      }
      return payload;
    } catch (error) {
      throw new Error("Problem in fetching user info " + error);
    }
  }

  async createAdmin(data) {
    try {
      if (!data.password) {
        return "Password is required";
      }
      const password = data.password;
      if (password != data.confirmPassword) {
        return "Passwords do not match";
      }
      const hashPassword = await createPassword(password);
      data.password = hashPassword;
      const user = await User.findOne({ email: data.email });
      if (user) {
        return "User already exists"; // mesmo com este erro da 201 corrigir para 409
      }
      const roleAdd = {
        role: roles.ADMIN,
      };
      const newData = Object.assign(data, roleAdd);
      const newAdmin = new User(newData);
      await newAdmin.save();
      return dataRole(newAdmin);
    } catch (error) {
      throw new Error("Problem in creating admin " + error);
    }
  }

  async allUsers(data) {
    try {
      // Filtro inicial e projeção
      const filter = {};
      const projection = { _id: 1, name: 1, email: 1, role: 1 }; // Projeta apenas os campos necessários

      if (data.role) {
        filter.role = data.role;
      }
      if (data.search) {
        filter.$or = [
          { name: { $regex: data.search, $options: "i" } },
          { email: { $regex: data.search, $options: "i" } },
        ];
      }

      // Calcula o total de usuários com o filtro aplicado (apenas se `totalPages` for necessário)
      const total = data.totalPages ? await User.countDocuments(filter) : null;
      const totalPages = data.totalPages ? Math.ceil(total / data.limit) : null;

      // Verifica se a página solicitada é válida
      const page = Math.min(Math.max(data.page || 1, 1), totalPages || 1);

      // Consulta principal com paginação e projeção
      const users = await User.find(filter)
        .select(projection)
        .skip((page - 1) * data.limit)
        .limit(parseInt(data.limit));

      // Supondo que `dataRole` pode ser substituído por uma projeção ou populate
      const payload = users.map((user) => ({
        ...user.toObject(),
      }));

      return {
        payload,
        total,
        page,
        pages: totalPages,
      };
    } catch (error) {
      throw new Error("Problem in fetching users: " + error);
    }
  }

  async getUserById(data) {
    try {
      const user = await User.findById(data);
      if (!user) {
        return "User not found";
      }
      return user;
    } catch (error) {
      throw new Error("Problem in fetching user by id " + error);
    }
  }
}
