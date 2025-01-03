import mongoose from "mongoose";

const ReportSchema = new mongoose.Schema({
  property: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Property",
    required: true,
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  agent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  saleDate: {
    type: Date,
    default: Date.now,
    required: true,
  },
  saleValue: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: false,
  },
});

const Report = mongoose.model("Report", ReportSchema);

export { Report };
