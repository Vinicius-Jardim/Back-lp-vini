import mongoose from "mongoose";
const licenseStatus = {
  ACTIVE: "active",
  SUSPENDED: "suspended",
  REVOKED: "revoked",
};

const AgentLicenseSchema = new mongoose.Schema(
  {
    licenseNumber: { type: String, required: true, unique: true },
    issueDate: { type: Date, required: true },
    issuingEntity: { type: String, required: true },
    licenseStatus: {
      type: String,
      enum: Object.values(licenseStatus),
      required: true,
    },
    holder: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  {
    timestamps: true,
  }
);

const AgentLicense = mongoose.model("AgentLicense", AgentLicenseSchema);

export { AgentLicense, licenseStatus };
