import { Property } from "../../models/propertyModel.js";
import { User } from "../../models/usersModel.js";
import { validID } from "../../utils/dataUtil.js";
import { Report } from "../../models/reportModel.js";

export class ReportService {
  async addReport(data) {
    try {
      const [property, client] = await Promise.all([
        Property.findById(data.property), // Fetch property details
        User.findOne({ email: data.client }),
      ]);

      if (!property) {
        return "Property not found";
      }

      if (!client) {
        return "Client not found";
      }

      const exists = await Report.findOne({
        property: data.property,
        client: client._id,
      });
      if (exists) {
        return "Report already exists";
      }

      // Create the report and update the property status
      const report = new Report({
        property: property._id,
        client: client._id,
        agent: data.agent,
        description: data.description,
        saleValue: data.saleValue,
        saleDate: data.saleDate,
      });
      property.status = "Sold";

      await Promise.all([property.save(), report.save()]);

      return report;
    } catch (error) {
      throw new Error("Error during report registration: " + error.message);
    }
  }

  async getReportById(data) {
    try {
      const report = await Report.findById(data);
      if (!report) {
        return "Report not found";
      }
      return report;
    } catch (error) {
      throw new Error("Error fetching report: " + error.message);
    }
  }

  /* Nao esta a ser usado
  async getReportsByField(field, id) {
    try {
      const user = await User.findById(id);

      const reports = await Report.find({ [field]: id });
      if (reports.length === 0) return "No reports found";
      return reports;
    } catch (error) {
      throw new Error(
        "Error fetching reports by " + field + ": " + error.message
      );
    }
  }
    */

  async getReportByProperty(data) {
    try {
      const isValid = validID(data.id);
      if (!isValid) {
        return "Invalid ID";
      }

      const property = await Property.findById(data.id);
      if (!property) {
        return "Property not found";
      }

      let filter = { property: property._id }; // Define que a busca deve ser por relatórios do agente

      // Se uma string de busca foi fornecida, aplica a busca nos campos relacionados
      if (data.search) {
        // Pesquisa por usuários
        const users = await User.find({
          $or: [
            { name: new RegExp(data.search, "i") }, // Pesquisa pelo nome do usuário
            { email: new RegExp(data.search, "i") }, // Pesquisa pelo email
          ],
        });

        // Coleta IDs correspondentes
        const userIds = users.map((user) => user._id); // IDs dos usuários encontrados

        // Adiciona as condições de pesquisa ao filtro
        filter.$or = [
          { client: { $in: userIds } }, // Relatórios com clientes que correspondem à busca
          { agent: { $in: userIds } }, // Relatórios com agentes que correspondem à busca
          { description: new RegExp(data.search, "i") }, // Relatórios que correspondem à descrição
        ];
      }

      // Conta o total de relatórios correspondentes ao filtro
      const totalReports = await Report.countDocuments(filter);

      // Calcula o total de páginas
      const totalPages = Math.ceil(totalReports / data.limit);

      // Verifica se a página solicitada é maior que o número de páginas disponíveis
      if (data.page > totalPages) {
        // Redireciona para a última página disponível
        data.page = totalPages;
      }

      // Caso o número da página seja inferior a 1, redireciona para a primeira página
      if (data.page < 1) {
        data.page = 1;
      }

      // Consulta os relatórios com paginação e filtro de busca
      const reports = await Report.find(filter)
        .skip((data.page - 1) * data.limit)
        .limit(data.limit);

      if (reports.length === 0) {
        return "No reports found";
      }

      // Retorna os relatórios paginados e o total de resultados
      return {
        reports,
        totalReports,
        totalPages: Math.ceil(totalReports / data.limit),
        currentPage: data.page,
      };
    } catch (error) {
      throw new Error("Error fetching reports by property: " + error.message);
    }
  }
  /* Nao esta a ser usado
  async getReportByClient(data) {
    try {
      const client = await User.findById(data.id);
      if (!client) {
        return "Client not found";
      }
      const reports = await Report.find({ client: data.id })
        .skip((data.page - 1) * data.limit)
        .limit(data.limit);
      if (reports.length === 0) {
        return "No reports found";
      }
      const totalReports = await Report.countDocuments({ client: data.id });
      return {
        reports,
        totalReports,
        totalPages: Math.ceil(totalReports / data.limit),
        currentPage: data.page,
      };
    } catch (error) {
      throw new Error("Error fetching reports by client: " + error.message);
    }
  }
    */

  async getReportByAgent(data) {
    try {
      const isValid = validID(data.id);
      if (!isValid) {
        return "Invalid ID";
      }
      // Verifica se o agente existe
      const agent = await User.findById(data.id);
      if (!agent) {
        return "Agent not found";
      }

      let filter = { agent: agent._id }; // Define que a busca deve ser por relatórios do agente

      // Se uma string de busca foi fornecida, aplica a busca nos campos relacionados
      if (data.search) {
        // Pesquisa por usuários
        const users = await User.find({
          $or: [
            { name: new RegExp(data.search, "i") }, // Pesquisa pelo nome do usuário
            { email: new RegExp(data.search, "i") }, // Pesquisa pelo email
          ],
        });

        // Pesquisa por propriedades
        const properties = await Property.find({
          $or: [
            { street: new RegExp(data.search, "i") }, // Pesquisa pelo nome da rua
            { city: new RegExp(data.search, "i") }, // Pesquisa pela cidade
            { description: new RegExp(data.search, "i") }, // Pesquisa pela descrição da propriedade
          ],
        });

        // Coleta IDs correspondentes
        const userIds = users.map((user) => user._id); // IDs dos usuários encontrados
        const propertyIds = properties.map((property) => property._id); // IDs das propriedades encontradas

        // Adiciona as condições de pesquisa ao filtro
        filter.$or = [
          { client: { $in: userIds } }, // Relatórios com clientes que correspondem à busca
          { property: { $in: propertyIds } }, // Relatórios com propriedades que correspondem à busca
          { description: new RegExp(data.search, "i") }, // Relatórios que correspondem à descrição
        ];
      }

      // Conta o total de relatórios correspondentes ao filtro
      const totalReports = await Report.countDocuments(filter);

      // Calcula o total de páginas
      const totalPages = Math.ceil(totalReports / data.limit);

      // Verifica se a página solicitada é maior que o número de páginas disponíveis
      if (data.page > totalPages) {
        // Redireciona para a última página disponível
        data.page = totalPages;
      }

      // Caso o número da página seja inferior a 1, redireciona para a primeira página
      if (data.page < 1) {
        data.page = 1;
      }

      // Consulta os relatórios com paginação e filtro de busca
      const reports = await Report.find(filter)
        .skip((data.page - 1) * data.limit)
        .limit(data.limit);

      if (reports.length === 0) {
        return "No reports found";
      }

      // Retorna os relatórios paginados e o total de resultados
      return {
        reports,
        totalReports,
        totalPages: Math.ceil(totalReports / data.limit),
        currentPage: data.page,
      };
    } catch (error) {
      throw new Error("Error fetching reports by agent: " + error.message);
    }
  }

  async getMyReports(data) {
    try {
      // Encontra o usuário logado pelo ID
      const user = await User.findById(data.user);

      // Define o filtro base para relatórios
      let filter = {};

      // Se não houver data.id, filtra de acordo com o papel do usuário logado
      if (user.role === "client") {
        filter.client = user._id;
      } else if (user.role === "agent") {
        filter.agent = user._id;
      }

      // Se uma string de busca foi fornecida, aplica a busca nos campos relacionados
      if (data.search) {
        // Pesquisa por usuários (cliente ou agente)
        const users = await User.find({
          $or: [
            { name: new RegExp(data.search, "i") }, // Pesquisa pelo nome do usuário (cliente ou agente)
            { email: new RegExp(data.search, "i") }, // Pesquisa pelo email
          ],
        });

        // Pesquisa por propriedades
        const properties = await Property.find({
          $or: [
            { street: new RegExp(data.search, "i") }, // Pesquisa pelo nome da rua
            { city: new RegExp(data.search, "i") }, // Pesquisa pela cidade
            { description: new RegExp(data.search, "i") }, // Pesquisa pela descrição da propriedade
          ],
        });

        // Coletar IDs correspondentes
        const userIds = users.map((user) => user._id);
        const propertyIds = properties.map((property) => property._id);

        // Adiciona a pesquisa ao filtro
        filter.$or = [
          { client: { $in: userIds } }, // Relatórios com clientes que correspondem à busca
          { agent: { $in: userIds } }, // Relatórios com agentes que correspondem à busca
          { property: { $in: propertyIds } }, // Relatórios com propriedades que correspondem à busca
          { description: new RegExp(data.search, "i") }, // Relatórios que correspondem à descrição
        ];
      }

      // Conta o total de relatórios correspondentes ao filtro
      const totalReports = await Report.countDocuments(filter);

      // Calcula o total de páginas
      const totalPages = Math.ceil(totalReports / data.limit);

      // Verifica se a página solicitada é maior que o número de páginas disponíveis
      if (data.page > totalPages) {
        // Redireciona para a última página disponível
        data.page = totalPages;
      }

      // Caso o número da página seja inferior a 1, redireciona para a primeira página
      if (data.page < 1) {
        data.page = 1;
      }

      // Consulta com paginação e filtros
      const reports = await Report.find(filter)
        .skip((data.page - 1) * data.limit)
        .limit(data.limit);

      // Verifica se relatórios foram encontrados
      if (reports.length === 0) {
        return "No reports found";
      }

      // Retorna os relatórios paginados e o total de resultados
      return {
        reports,
        totalReports,
        totalPages: Math.ceil(totalReports / data.limit),
        currentPage: data.page,
      };
    } catch (error) {
      throw new Error("Error fetching reports: " + error.message);
    }
  }

  async deleteReport(id) {
    try {
      const result = await Report.deleteOne({ _id: id });
      if (result.deletedCount === 0) {
        return "Report not found";
      }
      return "Report deleted successfully";
    } catch (error) {
      throw new Error("Error deleting report: " + error.message);
    }
  }
}
