import mongoose from "mongoose";

const PromotionRequestSchema = new mongoose.Schema({
  requestDate: { type: Date, required: true },
  emailAddress: { type: "String", required: true },
  agentLicense: { type: "String", required: true },
  employer: { type: "String", required: true },
  phoneNumber: { type: "String", required: true },
  requestType: {
    type: String,
    default: "promotion",
    immutable: true,
    required: true,
  },
  status: {
    type: String,
    default: "pending",
    enum: ["pending", "approved", "rejected"],
    required: true,
  },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  rejectedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

const PromotionRequest = mongoose.model(
  "PromotionRequest",
  PromotionRequestSchema
);

export { PromotionRequest };
