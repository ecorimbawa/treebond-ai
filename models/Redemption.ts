import { type Document, model, models, Schema, type Types } from "mongoose";

export interface IRedemption extends Document {
  rwa: Types.ObjectId;
  holder: Types.ObjectId;
  quantity: number;
  walletAddress: string;
  blockchain?: {
    transactionHash: string;
    burnTransactionHash?: string;
  };
  status: "REQUESTED" | "APPROVED" | "BURNED" | "RELEASED" | "REJECTED";
  requestedAt: Date;
  releasedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const redemptionSchema = new Schema<IRedemption>(
  {
    rwa: { type: Schema.Types.ObjectId, ref: "RWA", required: true },
    holder: { type: Schema.Types.ObjectId, ref: "User", required: true },
    quantity: { type: Number, required: true, min: 0 },
    walletAddress: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    blockchain: {
      transactionHash: { type: String, trim: true, lowercase: true },
      burnTransactionHash: { type: String, trim: true, lowercase: true },
    },
    status: {
      type: String,
      enum: ["REQUESTED", "APPROVED", "BURNED", "RELEASED", "REJECTED"],
      default: "REQUESTED",
    },
    requestedAt: { type: Date, required: true, default: Date.now },
    releasedAt: { type: Date },
  },
  { timestamps: true },
);

export default models.Redemption ||
  model<IRedemption>("Redemption", redemptionSchema);
