import mongoose, { Schema, Document } from 'mongoose';

export interface IBlockchainTransaction extends Document {
  txHash: string;
  chainId: number;
  contractAddress: string;
  functionName: string;
  fromAddress: string;
  toAddress: string;
  blockNumber: number;
  status: 'pending' | 'success' | 'failed';
  gasUsed: string;
  createdAt: Date;
}

const blockchainTransactionSchema = new Schema<IBlockchainTransaction>(
  {
    txHash: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    chainId: {
      type: Number,
      required: true,
    },
    contractAddress: {
      type: String,
      required: true,
      lowercase: true,
    },
    functionName: {
      type: String,
      required: true,
    },
    fromAddress: {
      type: String,
      required: true,
      lowercase: true,
    },
    toAddress: {
      type: String,
      required: true,
      lowercase: true,
    },
    blockNumber: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'success', 'failed'],
      default: 'pending',
    },
    gasUsed: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const BlockchainTransaction =
  mongoose.models.BlockchainTransaction ||
  mongoose.model<IBlockchainTransaction>('BlockchainTransaction', blockchainTransactionSchema);
