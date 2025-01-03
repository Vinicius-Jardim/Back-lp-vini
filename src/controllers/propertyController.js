import { HttpStatus } from "../utils/httpStatus.js";
import { calculateDistance, extractCoordinates } from "../utils/geoUtils.js";

export class PropertyController {
  constructor(propertyService) {
    this.propertyService = propertyService;
  }

  addProperty = async (req, res) => {
    try {
      const data = {
        type: req.body.type,
        floors: req.body.floors,
        garageSize: req.body.garageSize,
        agent: req.user,
        street: req.body.street,
        bathrooms: req.body.bathrooms,
        bedrooms: req.body.bedrooms,
        city: req.body.city,
        paths: req.paths,
        size: req.body.size,
        features: req.body.features,
        condition: req.body.condition,
        doorNumber: req.body.doorNumber,
        parish: req.body.parish,
        price: req.body.price,
        description: req.body.description,
        mapLocation: req.body.mapLocation,
        status: req.body.status,
        files: req.files,
      };
      const property = await this.propertyService.addProperty(data);
      res.status(201).json(property);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  allProperties = async (req, res) => {
    try {
      const data = {
        page: req.query.page || 1,
        limit: req.query.limit || 10,
        sort: req.query.sort || "price",
        type: req.query.type,
        search: req.query.search,
        garageSize: req.query.garageSize,
        bedrooms: req.query.bedrooms,
        bathrooms: req.query.bathrooms,
        minPrice: req.query.minPrice,
        maxPrice: req.query.maxPrice,
        minSize: req.query.minSize,
        maxSize: req.query.maxSize,
        features: req.query.features,
      };
      // Chamada do serviço com os dados processados
      const response = await this.propertyService.allProperties(data);
      res.status(HttpStatus.OK).json({ response });
    } catch (error) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: error.message });
    }
  };

  getPropertyById = async (req, res) => {
    try {
      const data = req.params.id;
      const property = await this.propertyService.getPropertyById(data);
      res.status(200).json(property);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  deleteProperty = async (req, res) => {
    try {
      const data = req.params.id;
      const property = await this.propertyService.deleteProperty(data);
      res.status(HttpStatus.OK).json(property);
    } catch (error) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ error: error.message });
    }
  };

  reserveProperty = async (req, res) => {
    try {
      const propertyId = req.params.id;
      const updatedProperty =
        await this.propertyService.reserveProperty(propertyId);
      res.status(200).json(updatedProperty);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  getSoldProperties = async (req, res) => {
    try {
      const data = {
        page: req.query.page || 1,
        limit: req.query.limit || 10,
        sort: req.query.sort || "price",
        type: req.query.type,
        search: req.query.search,
        bedrooms: req.query.bedrooms,
        bathrooms: req.query.bathrooms,
        minPrice: req.query.minPrice,
        maxPrice: req.query.maxPrice,
        minSize: req.query.minSize,
        maxSize: req.query.maxSize,
        features: req.query.features,
      };
      const response = await this.propertyService.getSoldProperties(data);
      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: error.message });
    }
  };

  getAgentProperties = async (req, res) => {
    try {
      const data = req.params.id;
      const properties = await this.propertyService.getAgentProperties(data);
      res.status(HttpStatus.OK).json(properties);
    } catch (error) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ error: error.message });
    }
  };

  updateProperty = async (req, res) => {
    try {
      const data = {
        id: req.params.id,
        floors: req.body.floors,
        garageSize: req.body.garageSize,
        agent: req.user,
        street: req.body.street,
        bathrooms: req.body.bathrooms,
        bedrooms: req.body.bedrooms,
        city: req.body.city,
        files: req.files,
        paths: req.paths,
        size: req.body.size,
        features: req.body.features,
        condition: req.body.condition,
        doorNumber: req.body.doorNumber,
        parish: req.body.parish,
        price: req.body.price,
        description: req.body.description,
        mapLocation: req.body.mapLocation,
        status: req.body.status,
      };
      const editedProperty = await this.propertyService.updateProperty(data);
      res.status(HttpStatus.OK).json(editedProperty);
    } catch (error) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ error: error.message });
    }
  };

  newReleases = async (req, res) => {
    try {
      const response = await this.propertyService.newReleases();
      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ error: error.message });
    }
  };

  getNearbyProperties = async (req, res) => {
    try {
      const { lat, lng, radius = 10 } = req.query; // radius em km, default 10km

      if (!lat || !lng) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          error: "Latitude e longitude são obrigatórios",
        });
      }

      const userLat = parseFloat(lat);
      const userLng = parseFloat(lng);

      // Busca todas as propriedades
      const result = await this.propertyService.allProperties({
        page: 1,
        limit: 1000, // Um número alto para pegar todas as propriedades
      });

      // Se não houver propriedades ou se o resultado for uma string de erro
      if (!result || typeof result === "string") {
        return res.status(HttpStatus.OK).json({
          count: 0,
          properties: [],
        });
      }

      const properties = result.properties;

      // Filtra as propriedades dentro do raio especificado
      const nearbyProperties = properties.filter((property) => {
        if (!property.mapLocation) {
          return false;
        }

        // Extrai as coordenadas do link do Google Maps
        const coords = extractCoordinates(property.mapLocation);

        if (!coords) {
          return false;
        }

        const distance = calculateDistance(
          userLat,
          userLng,
          coords.latitude,
          coords.longitude
        );

        property.distance = distance; // Adiciona a distância à propriedade

        return distance <= radius;
      });

      // Ordena por distância
      nearbyProperties.sort((a, b) => a.distance - b.distance);

      res.status(HttpStatus.OK).json({
        count: nearbyProperties.length,
        properties: nearbyProperties,
      });
    } catch (error) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ error: error.message });
    }
  };
}
