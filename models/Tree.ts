import mongoose, { Schema, Document, Types } from 'mongoose';

export type TreeStatus =
  | 'DRAFT'
  | 'REGISTERED'
  | 'PENDING_VERIFICATION'
  | 'VERIFIED'
  | 'AVAILABLE'
  | 'SPONSORED'
  | 'MONITORING'
  | 'MATURE'
  | 'REJECTED'
  | 'DEAD'
  | 'REMOVED'
  | 'REPLACED'
  | 'DISPUTED';

export interface ITree extends Document {
  projectId: Types.ObjectId;
  treeCode: string;
  species: string;
  latitude: number;
  longitude: number;
  plantedAt: Date;
  initialHeightCm: number;
  currentHeightCm: number;
  status: TreeStatus;
  tokenId?: number;
  contractAddress?: string;
  metadataCid?: string;
  ownerWallet?: string;
  createdAt: Date;
  updatedAt: Date;
}

const treeSchema = new Schema<ITree>(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    treeCode: {
      type: String,
      required: true,
      unique: true,
    },
    species: {
      type: String,
      required: true,
    },
    latitude: {
      type: Number,
      required: true,
    },
    longitude: {
      type: Number,
      required: true,
    },
    plantedAt: {
      type: Date,
      required: true,
    },
    initialHeightCm: {
      type: Number,
      required: true,
    },
    currentHeightCm: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: [
        'DRAFT',
        'REGISTERED',
        'PENDING_VERIFICATION',
        'VERIFIED',
        'AVAILABLE',
        'SPONSORED',
        'MONITORING',
        'MATURE',
        'REJECTED',
        'DEAD',
        'REMOVED',
        'REPLACED',
        'DISPUTED',
      ],
      default: 'DRAFT',
    },
    tokenId: {
      type: Number,
      default: null,
    },
    contractAddress: {
      type: String,
      default: null,
    },
    metadataCid: {
      type: String,
      default: null,
    },
    ownerWallet: {
      type: String,
      lowercase: true,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const Tree = mongoose.models.Tree || mongoose.model<ITree>('Tree', treeSchema);
