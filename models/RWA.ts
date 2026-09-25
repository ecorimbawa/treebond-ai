import { type Document, model, models, Schema, type Types } from "mongoose";

export interface IRWA extends Document {
  harvest: Types.ObjectId;
  verification: Types.ObjectId;
  tokenName: string;
  tokenSymbol: string;
  totalSupply: number;
  availableSupply: number;
  unit: "KG";
  blockchain: {
    network: "ARBITRUM_ONE";
    chainId: number;
    contractAddress: string;
    transactionHash: string;
    tokenId?: string;
  };
  status: "PENDING" | "ACTIVE" | "PARTIALLY_REDEEMED" | "REDEEMED";
  tokenizedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const rwaSchema = new Schema<IRWA>(
  {
    harvest: {
      type: Schema.Types.ObjectId,
      ref: "Harvest",
      required: true,
      unique: true,
    },
    verification: {
      type: Schema.Types.ObjectId,
      ref: "Verification",
      required: true,
    },
    tokenName: { type: String, required: true, trim: true },
    tokenSymbol: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    totalSupply: { type: Number, required: true, min: 0 },
    availableSupply: { type: Number, required: true, min: 0 },
    unit: { type: String, enum: ["KG"], default: "KG", required: true },
    blockchain: {
      network: {
        type: String,
        enum: ["ARBITRUM_ONE"],
        default: "ARBITRUM_ONE",
        required: true,
      },
      chainId: { type: Number, required: true },
      contractAddress: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
      },
      transactionHash: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
      },
      tokenId: { type: String, trim: true },
    },
    status: {
      type: String,
      enum: ["PENDING", "ACTIVE", "PARTIALLY_REDEEMED", "REDEEMED"],
      default: "PENDING",
    },
    tokenizedAt: { type: Date },
  },
  { timestamps: true },
);

export default models.RWA || model<IRWA>("RWA", rwaSchema);
