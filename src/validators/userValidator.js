import { body, param, query, validationResult } from "express-validator";
import mongoose from "mongoose";

export class UserValidator {
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

  static register() {
    return [
      body("name")
        .trim()
        .notEmpty()
        .withMessage("Name is required.")
        .isLength({ min: 3 })
        .withMessage("Name must be at least 3 characters long.")
        .isLength({ max: 50 })
        .withMessage("Name must not exceed 50 characters."),
      body("email")
        .trim()
        .notEmpty()
        .withMessage("Email is required.")
        .isEmail()
        .withMessage("Invalid email format.")
        .normalizeEmail(),
      body("password")
        .notEmpty()
        .withMessage("Password is required.")
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters long.")
        .isLength({ max: 100 })
        .withMessage("Password must not exceed 100 characters.")
        .matches(/\d/)
        .withMessage("Password must contain at least one digit.")
        .matches(/[!@#$%^&*]/)
        .withMessage("Password must contain at least one special character."),
      body("confirmPassword")
        .notEmpty()
        .withMessage("Confirm Password is required.")
        .custom((value, { req }) => {
          if (value !== req.body.password) {
            throw new Error("Passwords do not match.");
          }
          return true;
        }),
      (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }
        next();
      },
    ];
  }

  static login() {
    return [
      body("email")
        .trim()
        .notEmpty()
        .withMessage("Email is required.")
        .isEmail()
        .withMessage("Invalid email format.")
        .normalizeEmail(),
      body("password")
        .notEmpty()
        .withMessage("Password is required.")
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters long."),
      (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }
        next();
      },
    ];
  }

  static forgotPassword() {
    return [
      body("newPassword")
        .isLength({ min: 6 })
        .withMessage("A nova senha deve ter pelo menos 6 caracteres"),
      body("confirmPassword")
        .custom((value, { req }) => value === req.body.newPassword)
        .withMessage("As senhas não coincidem"),
      param("token").notEmpty().withMessage("Token é obrigatório"),
      (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }
        next();
      },
    ];
  }

  static forgotPasswordToken() {
    return [
      body("email").isEmail().withMessage("Email inválido"),
      (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }
        next();
      },
    ];
  }

  static userById() {
    return [
      param("id")
        .isMongoId()
        .withMessage("ID inválido, deve ser um ObjectId válido"),
      (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }
        next();
      },
    ];
  }

  static updateUser() {
    return [
      UserValidator.validateUserIdFromReq(),
      body("name")
        .optional()
        .isLength({ min: 3 })
        .withMessage("O nome deve ter pelo menos 3 caracteres"),
      body("email").optional().isEmail().withMessage("Email inválido"),
      body("phone")
        .optional()
        .isMobilePhone()
        .withMessage("Número de telefone inválido"),
      body("password")
        .optional()
        .isLength({ min: 6 })
        .withMessage("A senha deve ter pelo menos 6 caracteres"),
      body("confirmPassword")
        .optional()
        .custom((value, { req }) => value === req.body.password)
        .withMessage("As senhas não coincidem"),
      body("currentPassword")
        .optional()
        .notEmpty()
        .withMessage("A senha atual é obrigatória para atualizar a senha"),
      (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }
        next();
      },
    ];
  }

  static deleteUser() {
    return [
      param("id")
        .isMongoId()
        .withMessage("ID inválido, deve ser um ObjectId válido"),
      (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }
        next();
      },
    ];
  }

  static getAllAgents() {
    return [
      query("page")
        .optional()
        .isInt({ min: 1 })
        .withMessage("O número da página deve ser um inteiro maior que 0"),
      query("limit")
        .optional()
        .isInt({ min: 1 })
        .withMessage("O limite deve ser um inteiro maior que 0"),
      (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }
        next();
      },
    ];
  }

  static getAgentsbyEnterprise() {
    return [
      query("agency").notEmpty().withMessage("A agência é obrigatória"),
      query("page")
        .optional()
        .isInt({ min: 1 })
        .withMessage("O número da página deve ser um inteiro maior que 0"),
      query("limit")
        .optional()
        .isInt({ min: 1 })
        .withMessage("O limite deve ser um inteiro maior que 0"),
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
