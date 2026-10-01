import mongoose, { Schema, Document, Types } from 'mongoose';

export type VerificationStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'ON_CHAIN';

export interface IVerification extends Document {
  treeId: Types.ObjectId;
  evidenceId: Types.ObjectId;
  aiAnalysisId: Types.ObjectId;
  verifierId: Types.ObjectId;
  status: VerificationStatus;
  verificationScore: number;
  decision: 'approved' | 'rejected';
  reason: string;
  txHash?: string;
  blockNumber?: number;
  onChainTimestamp?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const verificationSchema = new Schema<IVerification>(
  {
    treeId: {
      type: Schema.Types.ObjectId,
      ref: 'Tree',
      required: true,
    },
    evidenceId: {
      type: Schema.Types.ObjectId,
      ref: 'TreeEvidence',
      required: true,
    },
    aiAnalysisId: {
      type: Schema.Types.ObjectId,
      ref: 'AiAnalysis',
      required: true,
    },
    verifierId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED', 'ON_CHAIN'],
      default: 'PENDING',
    },
    verificationScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    decision: {
      type: String,
      enum: ['approved', 'rejected'],
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
    txHash: {
      type: String,
      default: null,
    },
    blockNumber: {
      type: Number,
      default: null,
    },
    onChainTimestamp: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const Verification =
  mongoose.models.Verification || mongoose.model<IVerification>('Verification', verificationSchema);
