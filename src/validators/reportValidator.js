import { param, body, query, validationResult } from "express-validator";

export class ReportValidator {
  // Reusable validation for MongoDB ObjectId
  static isValidMongoId(field, fieldName) {
    return body(field)
      .isMongoId()
      .withMessage(`${fieldName} deve ser um ObjectId válido`);
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

  static validateErrors(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }

  static addReport() {
    return [
      ReportValidator.validateUserIdFromReq(),
      this.isValidMongoId("property", "O ID do imóvel"),
      this.isValidMongoId("client", "O ID do cliente"),
      body("agent")
        .optional()
        .isMongoId()
        .withMessage("O ID do agente deve ser um ObjectId válido"),
      body("description")
        .isString()
        .withMessage("A descrição deve ser uma string válida")
        .isLength({ max: 500 })
        .withMessage("A descrição não pode exceder 500 caracteres"),
      body("saleValue")
        .isFloat({ min: 0 })
        .withMessage("O valor de venda deve ser um número positivo"),
      body("saleDate")
        .isISO8601()
        .withMessage("A data de venda deve estar no formato ISO 8601")
        .toDate(),
      (req, res, next) => this.validateErrors(req, res, next),
    ];
  }

  static getReportById() {
    return [
      ReportValidator.validateUserIdFromReq(),
      param("id")
        .isMongoId()
        .withMessage("O ID do relatório deve ser um ObjectId válido"),
      (req, res, next) => this.validateErrors(req, res, next),
    ];
  }

  static getReportByQuery() {
    return [
      ReportValidator.validateUserIdFromReq(),
      query("id")
        .optional()
        .isMongoId()
        .withMessage("O ID deve ser um ObjectId válido"),
      query("page")
        .optional()
        .isInt({ min: 1 })
        .withMessage("A página deve ser um número inteiro maior que 0"),
      query("limit")
        .optional()
        .isInt({ min: 1 })
        .withMessage("O limite deve ser um número inteiro maior que 0"),
      query("search")
        .optional()
        .isString()
        .withMessage("O parâmetro de busca deve ser uma string válida"),
      (req, res, next) => this.validateErrors(req, res, next),
    ];
  }

  static deleteReport() {
    return [
      ReportValidator.validateUserIdFromReq(),
      param("id")
        .isMongoId()
        .withMessage("O ID do relatório deve ser um ObjectId válido"),
      (req, res, next) => this.validateErrors(req, res, next),
    ];
  }
}
