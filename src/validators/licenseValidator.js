import { body, param, query, validationResult } from "express-validator";
import mongoose from "mongoose";

export class LicenseValidator {
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
  // Validações para a criação de uma licença para o agente
  static createAgentLicense() {
    return [
      LicenseValidator.validateUserIdFromReq(),
      body("licenseNumber")
        .matches(/^[A-Za-z]{3}\d{6}$/) // Expressão regular para 3 letras seguidas de 6 números
        .withMessage(
          "O número da licença deve ter 3 letras no início e 6 números no final"
        )
        .notEmpty()
        .withMessage("O número da licença é obrigatório"),
      body("issueDate")
        .isISO8601()
        .withMessage(
          "A data de emissão deve ser uma data válida no formato ISO 8601"
        )
        .notEmpty()
        .withMessage("A data de emissão é obrigatória"),
      body("expiryDate")
        .isISO8601()
        .withMessage(
          "A data de expiração deve ser uma data válida no formato ISO 8601"
        )
        .notEmpty()
        .withMessage("A data de expiração é obrigatória"),
      body("issuingEntity")
        .isString()
        .withMessage("A entidade emissora deve ser uma string válida")
        .notEmpty()
        .withMessage("A entidade emissora é obrigatória"),
      body("licenseStatus")
        .isString()
        .withMessage("O status da licença deve ser uma string válida")
        .notEmpty()
        .withMessage("O status da licença é obrigatório"),
      (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }
        next();
      },
    ];
  }

  // Validações para obter a licença do próprio usuário
  static getOwnLicense() {
    return [
      LicenseValidator.validateUserIdFromReq(),
      (req, res, next) => {
        if (!req.user) {
          return res.status(400).json({ message: "Usuário não encontrado" });
        }
        next();
      },
    ];
  }

  // Validações para a remoção de licença
  static deleteLicense() {
    return [
      LicenseValidator.validateUserIdFromReq(),
      param("id")
        .isMongoId()
        .withMessage("O ID da licença deve ser um ObjectId válido")
        .notEmpty()
        .withMessage("O ID da licença é obrigatório"),
      (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }
        next();
      },
    ];
  }

  // Validações para obter todas as licenças
  static getAllLicenses() {
    return [
      LicenseValidator.validateUserIdFromReq(),
      query("page")
        .optional()
        .isInt({ min: 1 })
        .withMessage("A página deve ser um número inteiro positivo"),
      query("limit")
        .optional()
        .isInt({ min: 1 })
        .withMessage("O limite deve ser um número inteiro positivo"),
      query("status")
        .optional()
        .isString()
        .withMessage("O status deve ser uma string válida"),
      query("issuingEntity")
        .optional()
        .isString()
        .withMessage("A entidade emissora deve ser uma string válida"),
      query("expiryDate")
        .optional()
        .isISO8601()
        .withMessage(
          "A data de expiração deve ser uma data válida no formato ISO 8601"
        ),
      query("issueDate")
        .optional()
        .isISO8601()
        .withMessage(
          "A data de emissão deve ser uma data válida no formato ISO 8601"
        ),
      (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }
        next();
      },
    ];
  }

  // Validações para a requisição de licença
  static licenseRequest() {
    return [
      LicenseValidator.validateUserIdFromReq(),
      body("license")
        .notEmpty()
        .withMessage("O ID da licença é obrigatório"),
      body("phoneNumber")
        .isMobilePhone()
        .withMessage("O número de telefone deve ser válido")
        .notEmpty()
        .withMessage("O número de telefone é obrigatório"),
      body("employer")
        .isString()
        .withMessage("O empregador deve ser uma string válida")
        .notEmpty()
        .withMessage("O empregador é obrigatório"),
      (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }
        next();
      },
    ];
  }

  // Validações para atualizar o status da licença
  static updateLicense() {
    return [
      LicenseValidator.validateUserIdFromReq(),
      param("id")
        .isMongoId()
        .withMessage("O ID da licença deve ser um ObjectId válido")
        .notEmpty()
        .withMessage("O ID da licença é obrigatório"),
      body("status")
        .isString()
        .withMessage("O status deve ser uma string válida")
        .notEmpty()
        .withMessage("O status é obrigatório"),
      (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }
        next();
      },
    ];
  }

  // Validações para obter requisições de promoção
  static getPromotionRequests() {
    return [
      LicenseValidator.validateUserIdFromReq(),
      query("page")
        .optional()
        .isInt({ min: 1 })
        .withMessage("A página deve ser um número inteiro positivo"),
      query("limit")
        .optional()
        .isInt({ min: 1 })
        .withMessage("O limite deve ser um número inteiro positivo"),
      query("search")
        .optional()
        .isString()
        .withMessage("A busca deve ser uma string válida"),
      query("status")
        .optional()
        .isString()
        .withMessage("O status deve ser uma string válida"),
      query("requestType")
        .optional()
        .isString()
        .withMessage("O tipo de requisição deve ser uma string válida"),
      (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }
        next();
      },
    ];
  }

  // Validações para tomar decisão sobre a requisição de promoção
  static decisionPromotionRequest() {
    return [
      LicenseValidator.validateUserIdFromReq(),
      param("id")
        .isMongoId()
        .withMessage(
          "O ID da requisição de promoção deve ser um ObjectId válido"
        )
        .notEmpty()
        .withMessage("O ID da requisição de promoção é obrigatório"),
      body("decision")
        .isString()
        .withMessage("A decisão deve ser uma string válida")
        .notEmpty()
        .withMessage("A decisão é obrigatória"),
      (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }
        next();
      },
    ];
  }
}
