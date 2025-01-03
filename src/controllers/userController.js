import { HttpStatus } from "../utils/httpStatus.js";

export class UserController {
  constructor(userServices) {
    this.userServices = userServices;
  }

  register = async (req, res) => {
    try {
      const data = {
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
      };
      const response = await this.userServices.register(data);
      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: error.message });
    }
  };

  login = async (req, res) => {
    try {
      const data = {
        email: req.body.email,
        password: req.body.password,
      };
      const response = await this.userServices.login(data);

      // Check if there's an error in the response from userServices
      if (response.error) {
        return res
          .status(response.statusCode)
          .json({ message: response.message });
      }

      // Successful login
      res.status(HttpStatus.OK).json({ token: response.token });
    } catch (error) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: "Internal server error" });
    }
  };

  me = async (req, res) => {
    try {
      const response = await this.userServices.me(req.user);
      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: error.message });
    }
  };

  forgotPassword = async (req, res) => {
    try {
      const data = {
        newPassword: req.body.newPassword,
        confirmPassword: req.body.confirmPassword,
        token: req.params.token,
      };
      const response = await this.userServices.forgotPassword(data);
      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: error.message });
    }
  };

  forgotPasswordToken = async (req, res) => {
    try {
      const data = {
        email: req.body.email,
      };
      const response = await this.userServices.forgotPasswordToken(data);
      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: error.message });
    }
  };

  userById = async (req, res) => {
    try {
      const data = req.params.id;
      const response = await this.userServices.userById(data);
      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: error.message });
    }
  };

  updateUser = async (req, res) => {
    try {
      const data = {
        userId: req.user,
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        profilePaths: req.paths,
        profileFiles: req.files,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
        currentPassword: req.body.currentPassword,
      };
      const response = await this.userServices.updateUser(data);
      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: error.message });
    }
  };

  deleteUser = async (req, res) => {
    try {
      const data = req.user;
      const response = await this.userServices.deleteUser(data);
      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: error.message });
    }
  };

  getAllAgents = async (req, res) => {
    try {
      const data = {
        page: req.query.page || 1,
        limit: req.query.limit || 10,
      };

      const response = await this.userServices.getAllAgents(data);

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: error.message });
    }
  };

  getAgentsbyEnterprise = async (req, res) => {
    try {
      const data = {
        agency: req.query.agency,
        limit: req.query.limit || 10,
        page: req.query.page || 1,
      };
      const response = await this.userServices.getAgentsbyEnterprise(data);
      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: error.message });
    }
  };
}
