import mongoose, { type Document, Schema, type Types } from "mongoose";

export interface IAiAnalysis extends Document {
  evidenceId: Types.ObjectId;
  treeDetected: boolean;
  treeConfidence: number;
  healthScore: number;
  growthScore: number;
  anomalyRisk: "LOW" | "MEDIUM" | "HIGH";
  diseaseDetected: boolean;
  explanation: string;
  modelName: string;
  modelVersion: string;
  createdAt: Date;
}

const aiAnalysisSchema = new Schema<IAiAnalysis>(
  {
    evidenceId: {
      type: Schema.Types.ObjectId,
      ref: "TreeEvidence",
      required: true,
    },
    treeDetected: {
      type: Boolean,
      required: true,
    },
    treeConfidence: {
      type: Number,
      required: true,
      min: 0,
      max: 1,
    },
    healthScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    growthScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    anomalyRisk: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH"],
      required: true,
    },
    diseaseDetected: {
      type: Boolean,
      required: true,
    },
    explanation: {
      type: String,
      required: true,
    },
    modelName: {
      type: String,
      required: true,
    },
    modelVersion: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export const AiAnalysis =
  mongoose.models.AiAnalysis ||
  mongoose.model<IAiAnalysis>("AiAnalysis", aiAnalysisSchema);
