import mongoose, { type Document, Schema, type Types } from "mongoose";

export interface IWallet extends Document {
  userId: Types.ObjectId;
  address: string;
  chainId: number;
  isPrimary: boolean;
  verifiedAt?: Date;
  createdAt: Date;
}

const walletSchema = new Schema<IWallet>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    address: {
      type: String,
      required: true,
      lowercase: true,
    },
    chainId: {
      type: Number,
      required: true,
    },
    isPrimary: {
      type: Boolean,
      default: false,
    },
    verifiedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

walletSchema.index({ address: 1, chainId: 1 }, { unique: true });

export const Wallet =
  mongoose.models.Wallet || mongoose.model<IWallet>("Wallet", walletSchema);
