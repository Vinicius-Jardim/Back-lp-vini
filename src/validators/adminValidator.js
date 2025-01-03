import { body, param, query, validationResult } from "express-validator";
import mongoose from "mongoose";

export class AdminValidator {
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
  // Validação para allUsers
  static allUsers() {
    return [
      AdminValidator.validateUserIdFromReq(),
      query("page")
        .optional()
        .isInt({ min: 1 })
        .withMessage("O número da página deve ser um inteiro maior que 0"),
      query("limit")
        .optional()
        .isInt({ min: 1 })
        .withMessage("O limite deve ser um inteiro maior que 0"),
      query("role")
        .optional()
        .isString()
        .withMessage("O papel (role) deve ser uma string"),
      query("search")
        .optional()
        .isString()
        .withMessage("A busca deve ser uma string"),
      (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }
        next();
      },
    ];
  }

  // Validação para changeRoles
  static changeRoles() {
    return [
      AdminValidator.validateUserIdFromReq(),
      body("userId")
        .notEmpty()
        .withMessage("O ID do usuário é obrigatório")
        .isMongoId()
        .withMessage("O ID do usuário deve ser um MongoId válido"),
      body("newRole")
        .notEmpty()
        .withMessage("O novo papel é obrigatório")
        .isString()
        .withMessage("O novo papel deve ser uma string"),
      (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }
        next();
      },
    ];
  }

  // Validação para createUser
  static createUser() {
    return [
      AdminValidator.validateUserIdFromReq(),
      body("name")
        .notEmpty()
        .withMessage("O nome é obrigatório")
        .isLength({ min: 3 })
        .withMessage("O nome deve ter pelo menos 3 caracteres"),
      body("email")
        .notEmpty()
        .withMessage("O email é obrigatório")
        .isEmail()
        .withMessage("O email deve ser válido"),
      body("password")
        .notEmpty()
        .withMessage("A senha é obrigatória")
        .isLength({ min: 6 })
        .withMessage("A senha deve ter pelo menos 6 caracteres"),
      body("confirmPassword")
        .notEmpty()
        .withMessage("A confirmação da senha é obrigatória")
        .custom((value, { req }) => value === req.body.password)
        .withMessage("As senhas não coincidem"),
      (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }
        next();
      },
    ];
  }

  // Validação para deleteUser
  static deleteUser() {
    return [
      AdminValidator.validateUserIdFromReq(),
      param("userId")
        .notEmpty()
        .withMessage("O ID do usuário é obrigatório")
        .isMongoId()
        .withMessage("O ID do usuário deve ser um MongoId válido"),
      (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }
        next();
      },
    ];
  }

  // Validação para updateUser
  static updateUser() {
    return [
      AdminValidator.validateUserIdFromReq(),
      param("userId")
        .notEmpty()
        .withMessage("O ID do usuário é obrigatório")
        .isMongoId()
        .withMessage("O ID do usuário deve ser um MongoId válido"),
      body("name")
        .optional()
        .isLength({ min: 3 })
        .withMessage("O nome deve ter pelo menos 3 caracteres"),
      body("email").optional().isEmail().withMessage("O email deve ser válido"),
      body("password")
        .optional()
        .isLength({ min: 6 })
        .withMessage("A senha deve ter pelo menos 6 caracteres"),
      body("confirmPassword")
        .optional()
        .custom((value, { req }) => value === req.body.password)
        .withMessage("As senhas não coincidem"),
      (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }
        next();
      },
    ];
  }

  // Validação para getUserById
  static getUserById() {
    return [
      AdminValidator.validateUserIdFromReq(),
      param("userId")
        .notEmpty()
        .withMessage("O ID do usuário é obrigatório")
        .isMongoId()
        .withMessage("O ID do usuário deve ser um MongoId válido"),
      (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }
        next();
      },
    ];
  }

  // Validação para createAdmin
  static createAdmin() {
    return [
      AdminValidator.validateUserIdFromReq(),
      body("name")
        .notEmpty()
        .withMessage("O nome é obrigatório")
        .isLength({ min: 3 })
        .withMessage("O nome deve ter pelo menos 3 caracteres"),
      body("email")
        .notEmpty()
        .withMessage("O email é obrigatório")
        .isEmail()
        .withMessage("O email deve ser válido"),
      body("password")
        .notEmpty()
        .withMessage("A senha é obrigatória")
        .isLength({ min: 6 })
        .withMessage("A senha deve ter pelo menos 6 caracteres"),
      body("confirmPassword")
        .notEmpty()
        .withMessage("A confirmação da senha é obrigatória")
        .custom((value, { req }) => value === req.body.password)
        .withMessage("As senhas não coincidem"),
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
