import { Property } from "../../models/propertyModel.js";
import {
  createProperty,
  dataRole,
  fileExists,
  validID,
  deleteFile,
} from "../../utils/dataUtil.js";
import { roles, User } from "../../models/usersModel.js";
import path from "path";
import { saveFilesToDisk } from "../../middlewares/uploadImage.js";
import { Report } from "../../models/reportModel.js";
import { type, condition } from "../../models/propertyModel.js";
import { Wishlist } from "../../models/wishlistModel.js";

export class PropertyService {
  async addProperty(data) {
    try {
      // Validação do agente
      const user = await dataRole(data.agent);
      if (user.role !== roles.AGENT) {
        return "User is not an agent";
      }

      // Configuração de features padrão
      const allowedFeatures = [
        "airConditioning",
        "builtInCabinets",
        "elevator",
        "balcony",
        "garden",
        "pool",
      ];

      const features = {};
      const receivedFeatures = Array.isArray(data.features)
        ? data.features
        : data.features.split(",");

      allowedFeatures.forEach((feature) => {
        features[feature] = receivedFeatures.includes(feature);
      });

      // Configuração de paths para arquivos
      const pathFotos = data.paths?.fotos || [];
      const pathVideos = data.paths?.videos || [];
      const pathPlants = data.paths?.plants || [];

      // Validação de condição com base no tipo
      let validConditions;
      if (data.type === type.HOUSE || data.type === type.APARTMENT) {
        validConditions = condition.HOUSEANDAPARTMENT;
      } else if (data.type === type.LAND) {
        validConditions = condition.LAND;
      } else {
        throw new Error(`Tipo de propriedade inválido: ${data.type}`);
      }

      if (!validConditions.includes(data.condition)) {
        throw new Error(
          `Condição inválida para o tipo ${data.type}: ${data.condition}. Condições permitidas: ${validConditions.join(
            ", "
          )}`
        );
      }

      // Criação da propriedade
      const property = await createProperty({
        agent: data.agent,
        street: data.street,
        city: data.city,
        parish: data.parish,
        price: data.price,
        description: data.description,
        mapLocation: data.mapLocation,
        status: data.status,
        plants: pathPlants,
        fotos: pathFotos,
        videos: pathVideos,
        type: data.type,
        floors: data.floors,
        garageSize: data.garageSize,
        bathrooms: data.bathrooms,
        bedrooms: data.bedrooms,
        size: data.size,
        features: features,
        condition: data.condition,
        doorNumber: data.doorNumber,
      });

      // Salva os arquivos no disco
      const saveFiles = saveFilesToDisk(data.files, data.paths);

      return property;
    } catch (error) {
      throw new Error(`Problem in the addProperty: ${error.message}`);
    }
  }

  async allProperties(data) {
    try {
      const query = {};

      query.status = { $in: ["Available", "Reserved"] }; // Aceitar aopenas proprietades disponíveis ou reservadas

      // Filtra por tipo de propriedade (Terreno, Apartamento, Moradia)
      if (data.type) {
        const typesArray = data.type.split(","); // Exemplo: ?type=Terreno,Apartamento
        query.type = { $in: typesArray };
      }

      // Filtra por número de quartos
      if (data.bedrooms) {
        query.bedrooms = parseInt(data.bedrooms);
      }

      // Filtra por número de casas de banho
      if (data.bathrooms) {
        query.bathrooms = parseInt(data.bathrooms);
      }

      // Filtra por número de pisos
      if (data.floors) {
        query.floors = parseInt(data.floors);
      }

      // Filtra por tamanho da garagem
      if (data.garageSize) {
        query.garageSize = parseInt(data.garageSize);
      }

      // Filtro de preço
      if (data.minPrice || data.maxPrice) {
        query.price = {};
        if (data.minPrice) query.price.$gte = parseInt(data.minPrice); // Preço maior ou igual ao mínimo
        if (data.maxPrice) query.price.$lte = parseInt(data.maxPrice); // Preço menor ou igual ao máximo
      }

      // Filtro de tamanho
      if (data.minSize || data.maxSize) {
        query.size = {};
        if (data.minSize) query.size.$gte = parseInt(data.minSize); // Tamanho maior ou igual ao mínimo
        if (data.maxSize) query.size.$lte = parseInt(data.maxSize); // Tamanho menor ou igual ao máximo
      }

      // Filtro por atributos em `features`
      if (data.features) {
        const featuresArray = data.features.split(","); // Exemplo: ?features=airConditioning,pool
        featuresArray.forEach((feature) => {
          query[`features.${feature}`] = true; // Verifica se o atributo no features é true
        });
      }

      // Pesquisa com regex (por exemplo, em description, street ou city)
      if (data.search) {
        const regex = new RegExp(data.search, "i"); // "i" para case-insensitive
        query.$or = [
          { description: regex },
          { street: regex },
          { city: regex },
          { parish: regex },
        ];
      }

      // Conta o número total de propriedades que correspondem aos filtros
      const total = await Property.countDocuments(query);

      // Calcula o número total de páginas
      const totalPages = Math.ceil(total / data.limit);

      // Verifica se a página solicitada é maior que o número de páginas disponíveis
      if (data.page > totalPages) {
        // Redireciona para a última página disponível
        data.page = totalPages;
      }

      // Verifica se o número da página é menor que 1
      if (data.page < 1) {
        data.page = 1;
      }

      // Paginação
      let properties = await Property.find(query)
        .skip((data.page - 1) * data.limit) // Pula os documentos da página anterior
        .limit(parseInt(data.limit)); // Limita a quantidade de documentos retornados

      // Filtrar propriedades com status diferente de "Sold" após a busca
      properties = properties.filter((property) => property.status !== "Sold");
      if (properties.length === 0) {
        return "No properties found";
      }

      const payload = {
        properties,
        total,
        page: parseInt(data.page),
        pages: totalPages,
      };

      return payload;
    } catch (error) {
      throw new Error("Problem in fetching properties " + error);
    }
  }

  async getPropertyById(data) {
    try {
      const property = await Property.findById(data).populate({
        path: "agent",
        select: "name email phone image employer",
      });
      if (!property) {
        return "Property not found";
      }
      
      // Converte o preço para string com formato decimal
      if (property.price) {
        // Converte para string e adiciona .00 se for número inteiro
        const priceStr = property.price.toString();
        if (!priceStr.includes('.')) {
          property.price = priceStr + '.00';
        } else {
          // Se já tiver decimal, garante que tenha 2 casas
          property.price = parseFloat(priceStr).toFixed(2);
        }
      }
      
      return property;
    } catch (error) {
      throw new Error("Problem in fetching property by id " + error);
    }
  }

  // Método para deletar uma propriedade ver se nao tem que eliminar todos os relatorios associados a essa propriedade e outras coisas
  async deleteProperty(data) {
    try {
      // Encontra a propriedade primeiro
      const property = await Property.findById(data);
      if (!property) {
        return "Property not found";
      }

      // Combina todos os arquivos em uma lista, verificando se cada array existe
      const files = [
        ...(property.fotos || []),
        ...(property.videos || []),
        ...(property.plants || []),
      ];

      // Função para excluir os arquivos
      const deleteFiles = async (files) => {
        for (const file of files) {
          const filePath = path.join(file); // Ajuste o caminho conforme necessário
          await deleteFile(filePath);
        }
      };

      // Exclui os arquivos associados à propriedade
      await deleteFiles(files);

      // Agora pode deletar a propriedade do banco de dados
      await Property.findByIdAndDelete(data);

      // Remove todos os itens das wishlists que contêm essa propriedade
      await Wishlist.updateMany(
        { "items.property": data },
        { $pull: { items: { property: data } } }
      );

      // Deleta os relatórios associados
      await Report.deleteMany({ property: data });

      return "Property, related files, wishlist items, and reports removed successfully";
    } catch (error) {
      throw new Error("Problem in deleting property: " + error.message);
    }
  }

  async reserveProperty(propertyId) {
    try {
      const property = await Property.findOneAndUpdate(
        { _id: propertyId },
        { status: "Reserved" },
        { new: true }
      );
      if (!property) {
        throw new Error("Property not found");
      }
      return property;
    } catch (error) {
      throw new Error("Problem in reserving property: " + error.message);
    }
  }

  async getSoldProperties(data) {
    try {
      // Cria o objeto de filtro vazio
      const query = {};

      // Filtra por tipo de propriedade (Terreno, Apartamento, Moradia)
      if (data.type) {
        const typesArray = data.type.split(","); // Exemplo: ?type=Terreno,Apartamento
        query.type = { $in: typesArray };
      }

      // Filtro por número de quartos
      if (data.bedrooms) {
        query.bedrooms = parseInt(data.bedrooms);
      }

      // Filtro por número de casas de banho
      if (data.bathrooms) {
        query.bathrooms = parseInt(data.bathrooms);
      }

      // Filtro por número de pisos
      if (data.floors) {
        query.floors = parseInt(data.floors);
      }

      // Filtro por tamanho da garagem
      if (data.garageSize) {
        query.garageSize = parseInt(data.garageSize);
      }

      // Filtro de preço
      if (data.minPrice || data.maxPrice) {
        query.price = {};
        if (data.minPrice) query.price.$gte = parseInt(data.minPrice); // Preço maior ou igual ao mínimo
        if (data.maxPrice) query.price.$lte = parseInt(data.maxPrice); // Preço menor ou igual ao máximo
      }

      // Filtro de tamanho
      if (data.minSize || data.maxSize) {
        query.size = {};
        if (data.minSize) query.size.$gte = parseInt(data.minSize); // Tamanho maior ou igual ao mínimo
        if (data.maxSize) query.size.$lte = parseInt(data.maxSize); // Tamanho menor ou igual ao máximo
      }

      // Filtro por atributos em `features` (booleanos como airConditioning, pool, etc.)
      if (data.features) {
        const featuresArray = data.features.split(","); // Exemplo: ?features=airConditioning,pool
        featuresArray.forEach((feature) => {
          query[`features.${feature}`] = true; // Verifica se o atributo no features é true
        });
      }

      // Pesquisa com regex (por exemplo, em description, street ou city)
      if (data.search) {
        const regex = new RegExp(data.search, "i"); // "i" para case-insensitive
        query.$or = [
          { description: regex },
          { street: regex },
          { city: regex },
          { parish: regex },
        ];
      }

      // Conta o número total de propriedades que correspondem aos filtros
      const total = await Property.countDocuments({ ...query, status: "Sold" });

      // Calcula o número total de páginas
      const totalPages = Math.ceil(total / data.limit);

      // Verifica se a página solicitada é maior que o número de páginas disponíveis
      if (data.page > totalPages) {
        // Redireciona para a última página disponível
        data.page = totalPages;
      }

      // Verifica se o número da página é menor que 1
      if (data.page < 1) {
        data.page = 1; // Redireciona para a primeira página
      }

      // Paginação
      const properties = await Property.find({ ...query, status: "Sold" }) // Aplica o status diretamente aqui
        .skip((data.page - 1) * data.limit) // Pula os documentos da página anterior
        .limit(data.limit); // Limita a quantidade de documentos retornados

      if (properties.length === 0) {
        return "No properties found";
      }

      const payload = {
        properties,
        total,
        page: parseInt(data.page), // página atual
        pages: totalPages, // número total de páginas
      };

      return payload;
    } catch (error) {
      throw new Error("Problem in fetching sold properties: " + error.message);
    }
  }

  getAgentProperties = async (data) => {
    try {
      const valid = validID(data);
      if (!valid) {
        throw new Error("Data is invalid");
      }
      const agent = await User.findById(data);

      if (!agent) {
        return "Agent not found";
      }

      if (agent.role !== roles.AGENT) {
        return "User is not an agent";
      }

      const properties = await Property.find({ agent: data });
      if (properties.length === 0) {
        return "No properties found";
      }
      return properties;
    } catch (error) {
      throw new Error("Problem in fetching agent properties: " + error.message);
    }
  };

  async updateProperty(data) {
    try {
      // Busca a propriedade pelo ID para atualizar apenas os campos especificados
      const property = await Property.findById(data.id);
      if (!property) {
        throw new Error("Property not found");
      }

      // Atualiza os campos, se forem fornecidos em `data`
      if (data.type) property.type = data.type;
      if (data.floors) property.floors = data.floors;
      if (data.garageSize) property.garageSize = data.garageSize;
      if (data.street) property.street = data.street;
      if (data.city) property.city = data.city;
      if (data.size) property.size = data.size;
      if (data.condition) property.condition = data.condition;
      if (data.doorNumber) property.doorNumber = data.doorNumber;
      if (data.parish) property.parish = data.parish;
      if (data.price) {
        // Converte o preço para número e garante duas casas decimais
        const priceStr = data.price.toString().replace(',', '.');
        property.price = parseFloat(priceStr).toFixed(2);
      }
      if (data.description) property.description = data.description;
      if (data.mapLocation) property.mapLocation = data.mapLocation;
      if (data.status) property.status = data.status;

      // Se o tipo for "house" ou "apartment", adiciona `bathrooms` e `bedrooms` se fornecidos
      if (
        (property.type === type.HOUSE || property.type === type.APARTMENT) &&
        data.bathrooms
      ) {
        property.bathrooms = data.bathrooms;
      }
      if (
        (property.type === type.HOUSE || property.type === type.APARTMENT) &&
        data.bedrooms
      ) {
        property.bedrooms = data.bedrooms;
      }

      // Atualiza as features, tratando como array e convertendo para o formato necessário
      if (data.features) {
        const allowedFeatures = [
          "airConditioning",
          "builtInCabinets",
          "elevator",
          "balcony",
          "garden",
          "pool",
        ];

        const receivedFeatures = Array.isArray(data.features)
          ? data.features
          : data.features.split(",");

        const features = {};
        allowedFeatures.forEach((feature) => {
          features[feature] = receivedFeatures.includes(feature);
        });

        property.features = features;
      }
      // Salva novos arquivos no disco e remove os antigos apenas para os que foram atualizados
      if (data.files && data.paths) {
        if (data.files.fotos) {
          for (const oldFoto of property.fotos || []) {
            const oldFilePath = path.join(oldFoto);
            const oldFileExists = fileExists(oldFilePath);
            if (oldFileExists) {
              await deleteFile(oldFilePath);
            }
          }
        }
        if (data.files.videos) {
          for (const oldVideo of property.videos || []) {
            const oldFilePath = path.join(oldVideo);
            const oldFileExists = fileExists(oldFilePath);
            if (oldFileExists) {
              await deleteFile(oldFilePath);
            }
          }
        }
        if (data.files.plants) {
          for (const oldPlant of property.plants || []) {
            const oldFilePath = path.join(oldPlant);
            const oldFileExists = fileExists(oldFilePath);
            if (oldFileExists) {
              await deleteFile(oldFilePath); // Exclui cada planta antiga
            }
          }
        }

        // Salva os novos arquivos
        const savedFiles = saveFilesToDisk(data.files, data.paths);
        if (savedFiles.fotos) property.fotos = savedFiles.fotos;
        if (savedFiles.videos) property.videos = savedFiles.videos;
        if (savedFiles.plants) property.plants = savedFiles.plants;
      }

      // Salva as alterações no banco de dados
      await property.save();

      return property;
    } catch (error) {
      throw new Error("Problem in updating property: " + error.message);
    }
  }

  async newReleases() {
    try {
      const properties = await Property.find({
        status: { $in: ["Available", "Reserved"] },
      })
        .sort({ dateAdded: -1 }) // Ordena por data de adição (mais recente primeiro)
        .limit(6); // Limita a 5 propriedades

      if (properties.length === 0) {
        return "No new properties found";
      }

      return properties;
    } catch (error) {
      throw new Error("Problem in fetching new releases: " + error.message);
    }
  }
}
