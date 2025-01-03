import { AgentLicense, licenseStatus } from "../../models/agentLicenseModel.js";
import { PromotionRequest } from "../../models/promotionRequestModel.js";
import { User, roles } from "../../models/usersModel.js";
import { Wishlist } from "../../models/wishlistModel.js";

export class LicenseService {
  async createAgentLicense(data) {
    try {
      if (
        data.licenseStatus !== licenseStatus.ACTIVE &&
        data.licenseStatus !== licenseStatus.SUSPENDED &&
        data.licenseStatus !== licenseStatus.REVOKED
      ) {
        throw new Error("Invalid license status");
      }
      const license = await AgentLicense.create(data);
      await license.save();
      return "License created successfully";
    } catch (error) {
      // Verifica se o erro é de duplicidade (código 11000)
      if (
        error.code === 11000 &&
        error.keyPattern &&
        error.keyPattern.licenseNumber
      ) {
        throw new Error(
          "License number already exists. Please use a unique license number."
        );
      }
      throw new Error("Problem in the createAgentLicense " + error);
    }
  }

  async getOwnLicense(data) {
    try {
      const user = await User.findById(data.userId);
      if (user.role === "admin") {
        return "Admins do not have licenses";
      }
      const license = await AgentLicense.findOne({ holder: data.userId });
      if (!license) {
        return "No license found";
      }
      return license;
    } catch (error) {
      throw new Error("Problem in the getOwnLicense " + error);
    }
  }

  async deleteLicense(data) {
    try {
      const license = await AgentLicense.findById(data.id);
      if (!license) {
        throw new Error("License not found");
      }
      if (license.licenseStatus === licenseStatus.ACTIVE) {
        throw new Error("Cannot delete an active license");
      }
      if (license.licenseStatus === licenseStatus.SUSPENDED) {
        throw new Error("Cannot delete a suspended license");
      }
      if (license.holder) {
        const user = await User.findById(license.holder);
        Promise.all([
          user.updateOne({ $unset: { agentLicense: "" } }),
          user.updateOne({ role: dataRole.USER }),
          license.deleteOne(),
        ]);
      }
      await license.deleteOne();
    } catch (error) {
      throw new Error("Problem in the deleteLicense " + error);
    }
  }

  async AllLicenses(data) {
    try {
      const filter = {};
      if (data.status) filter.licenseStatus = new RegExp(data.status, "i");
      if (data.issuingEntity)
        filter.issuingEntity = new RegExp(data.issuingEntity, "i");
      if (data.expiryDate) filter.expiryDate = data.expiryDate;
      if (data.issueDate) filter.issueDate = data.issueDate;

      // Calcula o número total de documentos
      const totalLicenses = await AgentLicense.countDocuments(filter);

      // Calcula o número total de páginas
      const totalPages = Math.ceil(totalLicenses / data.limit);

      // Corrige a página solicitada para a mais próxima disponível, se necessário
      const correctedPage = data.page > totalPages ? totalPages : data.page;

      // Caso não existam licenças, retorna uma mensagem apropriada
      if (totalLicenses === 0) {
        return "No licenses found matching the criteria";
      }

      // Calcula o número de documentos a pular com base na página corrigida
      const skip = (correctedPage - 1) * data.limit;

      // Realiza a consulta com paginação e filtro
      const licenses = await AgentLicense.find(filter)
        .skip(skip)
        .limit(data.limit);

      return {
        licenses,
        currentPage: correctedPage,
        totalPages,
        totalLicenses,
      };
    } catch (error) {
      throw new Error("Problem in the AllLicenses: " + error.message);
    }
  }

  async updateLicense(data) {
    try {
      const license = await AgentLicense.findById(data.id);
      if (!license) {
        throw new Error("License not found");
      }
      if (data.status) {
        if (
          data.status !== licenseStatus.ACTIVE &&
          data.status !== licenseStatus.SUSPENDED &&
          data.status !== licenseStatus.REVOKED
        ) {
          throw new Error("Invalid license status");
        }
        license.licenseStatus = data.status;
      }
      await license.save();
      if (data.status === licenseStatus.REVOKED) {
        const user = await User.findById(license.holder);
        if (user) {
          license.holder = null;
          const wishlist = await Wishlist.create({ user: user._id });
          user.wishlist = wishlist._id;
          user.role = roles.CLIENT;
          user.employer = null;
          await license.save();
          await user.save();
          return "License status updated successfully";
        }
        await license.save();
      }
      if (data.status === licenseStatus.SUSPENDED) {
        const user = await User.findById(license.holder);
        if (user) {
          user.role = roles.CLIENT;
          const wishlist = await Wishlist.create({ user: user._id });
          user.wishlist = wishlist._id;
          user.employer = null;
          await user.save();
          console.log(user);
          return "License status updated successfully";
        }
        await license.save();
      }
      if (data.status === licenseStatus.ACTIVE) {
        const user = await User.findById(license.holder);
        if (user) {
          user.role = roles.AGENT;
          user.wishlist = null;
          await Wishlist.deleteOne({ user: user._id });
          user.employer = license.issuingEntity;
          await user.save();
          return "License status updated successfully";
        }
        await license.save();
      }
      return "License status updated successfully";
    } catch (error) {
      throw new Error("Problem in the updateLicense: " + error.message);
    }
  }

  async licenseRequest(data) {
    try {
      const user = await User.findById(data.user);
      const email = user.email;
      // Aguarda a consulta da licença
      const license = await AgentLicense.findOne({
        licenseNumber: data.agentLicense,
        issuingEntity: data.employer,
      });

      if (!license) {
        throw new Error("License not found");
      }
      if (license.holder) {
        throw new Error("License already in use");
      }

      const request = await PromotionRequest.create({
        agentLicense: data.agentLicense,
        phoneNumber: data.phoneNumber,
        employer: data.employer,
        emailAddress: email,
        user: data.user,
        requestDate: new Date(),
        status: "pending",
      });
      await request.save();
      return "Request created successfully";
    } catch (error) {
      throw new Error("Problem in the licenseRequest " + error);
    }
  }

  async getById(data) {
    try {
      const license = await AgentLicense.findById(data.id);
      if (!license) {
        return "License not found";
      }
      return license;
    } catch (error) {
      throw new Error("Problem in the getById " + error);
    }
  }

  async getPromotionRequests(data) {
    try {
      const filter = {};

      // Adiciona o filtro de status, se presente
      if (data.status) {
        filter.status = new RegExp(data.status, "i");
      }

      // Adiciona o filtro de requestType, se presente
      if (data.requestType) {
        filter.requestType = new RegExp(data.requestType, "i");
      }

      // Adiciona o filtro de busca (search) em múltiplos campos
      if (data.search) {
        const searchRegex = new RegExp(data.search, "i"); // expressão regular para busca case-insensitive
        filter.$or = [
          { emailAddress: searchRegex },
          { employer: searchRegex },
          { agentLicense: searchRegex },
        ];
      }

      // Calcula o número total de solicitações
      const totalRequests = await PromotionRequest.countDocuments(filter);

      // Calcula o número total de páginas
      const totalPages = Math.ceil(totalRequests / data.limit);

      // Corrige a página solicitada para a mais próxima disponível, se necessário
      const correctedPage = data.page > totalPages ? totalPages : data.page;

      // Caso não existam solicitações, retorna uma mensagem apropriada
      if (totalRequests === 0) {
        return "No promotion requests found matching the criteria";
      }

      // Calcula o número de documentos a pular com base na página corrigida
      const skip = (correctedPage - 1) * data.limit;

      // Realiza a consulta com paginação e filtro
      const requests = await PromotionRequest.find(filter)
        .skip(skip)
        .limit(data.limit);

      return {
        requests,
        currentPage: correctedPage,
        totalPages,
        totalRequests,
      };
    } catch (error) {
      throw new Error("Problem in the getPromotionRequests: " + error.message);
    }
  }

  async decisionPromotionRequest(data) {
    try {
      if (data.decision !== "reject" && data.decision !== "accept") {
        throw new Error("Invalid decision");
      }
      const request = await PromotionRequest.findById(data.id);
      if (!request) {
        throw new Error("Request not found");
      }

      const user = await User.findById(request.user);
      if (user.role === "admin") {
        throw new Error("Admins do not have licenses");
      }
      if (request.status === "approved") {
        throw new Error("Request already accepted");
      }
      if (request.status === "rejected") {
        throw new Error("Request already rejected");
      }
      if (data.decision === "reject") {
        request.status = "rejected";
        request.rejectedBy = data.user;
        await request.save();
        return "Request rejected successfully";
      }
      request.status = "approved";
      request.approvedBy = data.user;
      await request.save();

      const license = await AgentLicense.findOne({
        licenseNumber: request.agentLicense,
        issuingEntity: request.employer,
      });
      if (!license) {
        throw new Error("License not found");
      }
      license.holder = request.user;
      await license.save();

      Promise.all([
        user.updateOne({ role: roles.AGENT }),
        user.updateOne({ employer: license.issuingEntity }),
        user.updateOne({ phone: request.phoneNumber }),
      ]);
      return "Request accepted successfully";
    } catch (error) {
      throw new Error(
        "Problem in the decisionPromotionReques " + error.message
      );
    }
  }
}
