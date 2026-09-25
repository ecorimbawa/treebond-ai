import { type Document, model, models, Schema, type Types } from "mongoose";

export interface IVerification extends Document {
  harvest: Types.ObjectId;
  verifier: Types.ObjectId;
  claimedQuantity: number;
  verifiedQuantity: number;
  status: "PENDING" | "APPROVED" | "REJECTED";
  notes?: string;
  evidence?: {
    url: string;
    type: "IMAGE" | "DOCUMENT";
  }[];
  verifiedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const verificationSchema = new Schema<IVerification>(
  {
    harvest: { type: Schema.Types.ObjectId, ref: "Harvest", required: true },
    verifier: { type: Schema.Types.ObjectId, ref: "User", required: true },
    claimedQuantity: { type: Number, required: true, min: 0 },
    verifiedQuantity: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING",
    },
    notes: { type: String, trim: true },
    evidence: [
      {
        _id: false,
        url: { type: String, required: true, trim: true },
        type: { type: String, enum: ["IMAGE", "DOCUMENT"], required: true },
      },
    ],
    verifiedAt: { type: Date },
  },
  { timestamps: true },
);

export default models.Verification ||
  model<IVerification>("Verification", verificationSchema);
