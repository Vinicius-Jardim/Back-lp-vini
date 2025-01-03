import { body, query, param, validationResult } from "express-validator";
import multer from "multer";
import mongoose from "mongoose";
import { type } from "../models/propertyModel.js";

const upload = multer();

export class PropertyValidator {
  // Validação reutilizável para MongoDB ObjectId
  static isValidMongoId(field, fieldName) {
    return param(field)
      .isMongoId()
      .withMessage(`${fieldName} deve ser um ObjectId válido.`);
  }

  static validateUserIdFromReq() {
    return body().custom((_, { req }) => {
      if (!req.user) {
        throw new Error("O usuário não está autenticado.");
      }
      if (!mongoose.Types.ObjectId.isValid(req.user)) {
        throw new Error("O ID do usuário deve ser um MongoId válido.");
      }
      return true;
    });
  }

  // Validação reutilizável para erros
  static validateErrors(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }

  // Validação para adicionar uma propriedade
  static addPropertyValidation = [
    PropertyValidator.validateUserIdFromReq(),
    body("type")
      .notEmpty()
      .withMessage("O tipo da propriedade é obrigatório.")
      .isString()
      .withMessage("O tipo deve ser uma string."),
    body("floors")
      .if((value, { req }) => req.body.type !== type.LAND)
      .optional()
      .isInt({ min: 0 })
      .withMessage("O número de andares deve ser um inteiro positivo."),
    body("garageSize")
      .if((value, { req }) => req.body.type !== type.LAND)
      .optional()
      .isInt({ min: 0 })
      .withMessage("O tamanho da garagem deve ser um inteiro positivo."),
    body("bathrooms")
      .if((value, { req }) => req.body.type !== type.LAND)
      .optional()
      .isInt({ min: 0 })
      .withMessage("O número de banheiros deve ser um inteiro positivo."),
    body("bedrooms")
      .if((value, { req }) => req.body.type !== type.LAND)
      .optional()
      .isInt({ min: 0 })
      .withMessage("O número de quartos deve ser um inteiro positivo."),
    body("street")
      .notEmpty()
      .withMessage("A rua é obrigatória.")
      .isString()
      .withMessage("A rua deve ser uma string."),
    body("city")
      .notEmpty()
      .withMessage("A cidade é obrigatória.")
      .isString()
      .withMessage("A cidade deve ser uma string."),
    body("size")
      .notEmpty()
      .withMessage("O tamanho é obrigatório.")
      .isFloat({ min: 0 })
      .withMessage("O tamanho deve ser um número positivo."),
    body("features")
      .if((value, { req }) => req.body.type !== type.LAND)
      .optional()
      .custom((value) => {
        if (!value) return true;
        // Handle both array and comma-separated string
        const features = Array.isArray(value) ? value : value.split(',').filter(Boolean);
        return Array.isArray(features);
      })
      .withMessage("As características devem ser uma lista."),
    body("condition")
      .optional()
      .isString()
      .withMessage("A condição deve ser uma string."),
    body("doorNumber")
      .optional()
      .isInt({ min: 0 })
      .withMessage("O número da porta deve ser um inteiro positivo."),
    body("parish")
      .optional()
      .isString()
      .withMessage("A paróquia deve ser uma string."),
    body("price")
      .notEmpty()
      .withMessage("O preço é obrigatório.")
      .isFloat({ min: 0 })
      .withMessage("O preço deve ser um número positivo."),
    body("description")
      .optional()
      .isString()
      .withMessage("A descrição deve ser uma string."),
    body("mapLocation")
      .optional()
      .isString()
      .withMessage("A localização no mapa deve ser uma string."),
    body("status")
      .optional()
      .isString()
      .withMessage("O status deve ser uma string."),
    (req, res, next) => this.validateErrors(req, res, next),
  ];

  // Validação para atualizar uma propriedade
  static updatePropertyValidation = [
    PropertyValidator.validateUserIdFromReq(),
    this.isValidMongoId("id", "O ID da propriedade"),
    ...this.addPropertyValidation,
  ];

  // Validação para buscar uma propriedade pelo ID
  static getPropertyByIdValidation = [
    this.isValidMongoId("id", "O ID da propriedade"),
    (req, res, next) => this.validateErrors(req, res, next),
  ];

  // Validação para deletar uma propriedade
  static deletePropertyValidation = [
    PropertyValidator.validateUserIdFromReq(),
    this.isValidMongoId("id", "O ID da propriedade"),
    (req, res, next) => this.validateErrors(req, res, next),
  ];

  // Validação para reservar uma propriedade
  static reservePropertyValidation = [
    PropertyValidator.validateUserIdFromReq(),
    this.isValidMongoId("id", "O ID da propriedade"),
    (req, res, next) => this.validateErrors(req, res, next),
  ];

  // Validação para buscar todas as propriedades
  static allPropertiesValidation = [
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("A página deve ser um número inteiro positivo."),
    query("limit")
      .optional()
      .isInt({ min: 1 })
      .withMessage("O limite deve ser um número inteiro positivo."),
    query("sort")
      .optional()
      .isString()
      .withMessage("O campo de ordenação deve ser uma string."),
    query("type")
      .optional()
      .isString()
      .withMessage("O tipo deve ser uma string."),
    query("search")
      .optional()
      .isString()
      .withMessage("A busca deve ser uma string."),
    query("garageSize")
      .optional()
      .isInt({ min: 0 })
      .withMessage("O tamanho da garagem deve ser um inteiro positivo."),
    query("bedrooms")
      .optional()
      .isInt({ min: 0 })
      .withMessage("O número de quartos deve ser um inteiro positivo."),
    query("bathrooms")
      .optional()
      .isInt({ min: 0 })
      .withMessage("O número de banheiros deve ser um inteiro positivo."),
    query("minPrice")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("O preço mínimo deve ser um número positivo."),
    query("maxPrice")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("O preço máximo deve ser um número positivo."),
    query("minSize")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("O tamanho mínimo deve ser um número positivo."),
    query("maxSize")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("O tamanho máximo deve ser um número positivo."),
    query("features")
      .optional()
      .custom((value) => {
        if (!value) return true;
        // Handle both array and comma-separated string
        const features = Array.isArray(value) ? value : value.split(',').filter(Boolean);
        return Array.isArray(features);
      })
      .withMessage("As características devem ser uma lista."),
    (req, res, next) => this.validateErrors(req, res, next),
  ];

  // Validação para buscar propriedades próximas
  static getNearbyPropertiesValidation = [
    query("lat")
      .notEmpty()
      .withMessage("Latitude é obrigatória.")
      .isFloat()
      .withMessage("Latitude deve ser um número."),
    query("lng")
      .notEmpty()
      .withMessage("Longitude é obrigatória.")
      .isFloat()
      .withMessage("Longitude deve ser um número."),
    query("radius")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("O raio deve ser um número positivo."),
    (req, res, next) => this.validateErrors(req, res, next),
  ];

  // Validação para propriedades vendidas
  static getSoldPropertiesValidation =
    PropertyValidator.allPropertiesValidation;

  // Validação para propriedades de um agente
  static getAgentPropertiesValidation = [
    this.isValidMongoId("id", "O ID do agente"),
    (req, res, next) => this.validateErrors(req, res, next),
  ];
}
