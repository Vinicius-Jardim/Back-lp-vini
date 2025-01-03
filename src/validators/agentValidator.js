import mongoose from "mongoose";
import { check, validationResult } from "express-validator";

export class AgentValidator {
  // Validação para getProperties
  static getProperties() {
    return [
      check("user").custom((value, { req }) => {
        if (!req.user) {
          throw new Error("O usuário não está autenticado.");
        }
        if (!mongoose.Types.ObjectId.isValid(req.user)) {
          throw new Error("O ID do usuário deve ser um MongoId válido.");
        }
        return true; // Retorna true se passar a validação
      }),

      // Middleware para capturar e retornar erros de validação
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
