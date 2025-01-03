import { HttpStatus } from "../utils/httpStatus.js";

export class LicenseController {
  constructor(licenseService) {
    this.licenseService = licenseService;
  }

  createAgentLicense = async (req, res) => {
    try {
      const data = {
        licenseNumber: req.body.licenseNumber,
        issueDate: req.body.issueDate,
        expiryDate: req.body.expiryDate,
        issuingEntity: req.body.issuingEntity,
        licenseStatus: req.body.licenseStatus,
      };
      const license = await this.licenseService.createAgentLicense(data);
      res.status(HttpStatus.CREATED).json(license);
    } catch (error) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ error: error.message });
    }
  };

  getOwnLicense = async (req, res) => {
    try {
      const data = {
        userId: req.user,
      };
      const license = await this.licenseService.getOwnLicense(data);
      res.status(HttpStatus.OK).json(license);
    } catch (error) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ error: error.message });
    }
  };

  deleteLicense = async (req, res) => {
    try {
      const data = {
        id: req.params.id,
      };
      await this.licenseService.deleteLicense(data);
      res.status(HttpStatus.OK).send();
    } catch (error) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ error: error.message });
    }
  };

  getById = async (req, res) => {
    try {
      const data = {
        id: req.params.id,
      };
      const license = await this.licenseService.getById(data);
      res.status(HttpStatus.OK).json(license);
    } catch (error) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ error: error.message });
    }
  };

  AllLicenses = async (req, res) => {
    try {
      const data = {
        page: req.query.page || 1,
        limit: req.query.limit || 10,
        status: req.query.status,
        issuingEntity: req.query.issuingEntity,
        expiryDate: req.query.expiryDate,
        issueDate: req.query.issueDate,
      };
      const licenses = await this.licenseService.AllLicenses(data);
      res.status(HttpStatus.OK).json(licenses);
    } catch (error) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ error: error.message });
    }
  };

  licenseRequest = async (req, res) => {
    try {
      const data = {
        agentLicense: req.body.license,
        phoneNumber: req.body.phoneNumber,
        employer: req.body.employer,
        user: req.user,
      };
      const request = await this.licenseService.licenseRequest(data);
      res.status(HttpStatus.CREATED).json(request);
    } catch (error) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ error: error.message });
    }
  };

  updateLicense = async (req, res) => {
    try {
      const data = {
        id: req.params.id,
        status: req.body.status,
      };
      const license = await this.licenseService.updateLicense(data);
      res.status(HttpStatus.OK).json(license);
    } catch (error) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ error: error.message });
    }
  };

  getPromotionRequests = async (req, res) => {
    try {
      const data = {
        page: req.query.page || 1,
        limit: req.query.limit || 10,
        search: req.query.search,
        status: req.query.status,
        requestType: req.query.requestType,
      };
      const requests = await this.licenseService.getPromotionRequests(data);
      res.status(HttpStatus.OK).json(requests);
    } catch (error) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ error: error.message });
    }
  };

  decisionPromotionRequest = async (req, res) => {
    try {
      const data = {
        id: req.params.id,
        user: req.user,
        decision: req.body.decision,
      };
      await this.licenseService.decisionPromotionRequest(data);
      res.status(HttpStatus.OK).send();
    } catch (error) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ error: error.message });
    }
  };
}
