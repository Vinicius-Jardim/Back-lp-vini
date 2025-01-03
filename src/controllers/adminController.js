import { validID } from "../utils/dataUtil.js";
import { HttpStatus } from "../utils/httpStatus.js";

export class AdminController {
  constructor(adminController) {
    this.adminController = adminController;
  }

  allUsers = async (req, res) => {
    try {
      const response = await this.adminController.allUsers(req.user);
      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: error.message });
    }
  };

  changeRoles = async (req, res) => {
    try {
      const data = {
        userId: req.body.userId,
        newRole: req.body.newRole,
      };
      const response = await this.adminController.changeRoles(data);
      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: error.message });
    }
  };

  getDashboard = async (req, res) => {
    try {
      const dashboardData = await this.adminController.getDashboardData();
      res.status(200).json(dashboardData);
    } catch (error) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: error.message });
    }
  };

  createUser = async (req, res) => {
    try {
      const userData = req.body;
      const newUser = await this.adminController.createUser(userData);
      res.status(201).json(newUser);
    } catch (error) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: error.message });
    }
  };

  deleteUser = async (req, res) => {
    try {
      const userId = req.params.userId;
      const response = await this.adminController.deleteUser(userId);
      res.status(200).json(response);
    } catch (error) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: error.message });
    }
  };

  updateUser = async (req, res) => {
    try {
      const userId = req.params.userId;
      const userData = req.body;
      const updatedUser = await this.adminController.updateUser(
        userId,
        userData
      );
      res.status(200).json(updatedUser);
    } catch (error) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: error.message });
    }
  };

  allUsers = async (req, res) => {
    try {
      const data = {
        page: req.query.page || 1,
        limit: req.query.limit || 10,
        role: req.query.role,
        search: req.query.search,
      };
      const response = await this.adminController.allUsers(data);
      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: error.message });
    }
  };

  getUserById = async (req, res) => {
    try {
      const data = req.params.userId;
      const response = await this.adminController.getUserById(data);
      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: error.message });
    }
  };

  createAdmin = async (req, res) => {
    try {
      const data = {
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
      };
      const response = await this.adminController.createAdmin(data);
      res.status(HttpStatus.CREATED).json(response);
    } catch (error) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: error.message });
    }
  };
}
