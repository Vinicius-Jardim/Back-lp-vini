import { param, body, query, validationResult } from "express-validator";
import mongoose from "mongoose";

export class WishlistValidator {
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

  static addToWishlist() {
    return [
      WishlistValidator.validateUserIdFromReq(),
      param("itemId")
        .isMongoId()
        .withMessage("O ID do item deve ser um ObjectId válido"),
      body("note")
        .optional()
        .isString()
        .isLength({ max: 500 })
        .withMessage("A nota deve ser uma string com no máximo 500 caracteres"),
      (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }
        next();
      },
    ];
  }

  static removeFromWishlist() {
    return [
      WishlistValidator.validateUserIdFromReq(),
      param("itemId")
        .isMongoId()
        .withMessage("O ID do item deve ser um ObjectId válido"),
      (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }
        next();
      },
    ];
  }

  static viewWishlist() {
    return [
      WishlistValidator.validateUserIdFromReq(),
      (req, res, next) => {
        // Sem parâmetros adicionais, apenas continue.
        next();
      },
    ];
  }

  static clearWishlist() {
    return [
      WishlistValidator.validateUserIdFromReq(),
      (req, res, next) => {
        // Sem parâmetros adicionais, apenas continue.
        next();
      },
    ];
  }

  static viewAllWishlist() {
    return [
      WishlistValidator.validateUserIdFromReq(),
      query("limit")
        .optional()
        .isInt({ min: 1 })
        .withMessage("O limite deve ser um inteiro maior que 0"),
      query("page")
        .optional()
        .isInt({ min: 1 })
        .withMessage("A página deve ser um inteiro maior que 0"),
      query("itemProperty")
        .optional()
        .isString()
        .withMessage("A propriedade do item deve ser uma string válida"),
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
