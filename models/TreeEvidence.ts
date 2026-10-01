import mongoose, { Schema, Document, Types } from 'mongoose';

export type EvidenceType =
  | 'INITIAL_PLANTING'
  | 'MONITORING'
  | 'HEALTH_CHECK'
  | 'GROWTH_CHECK'
  | 'DEATH_REPORT'
  | 'REPLACEMENT'
  | 'GPS_CHECK';

export interface ITreeEvidence extends Document {
  treeId: Types.ObjectId;
  type: EvidenceType;
  imageCid: string;
  metadataCid?: string;
  latitude: number;
  longitude: number;
  capturedAt: Date;
  submittedBy: Types.ObjectId;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
}

const treeEvidenceSchema = new Schema<ITreeEvidence>(
  {
    treeId: {
      type: Schema.Types.ObjectId,
      ref: 'Tree',
      required: true,
    },
    type: {
      type: String,
      enum: [
        'INITIAL_PLANTING',
        'MONITORING',
        'HEALTH_CHECK',
        'GROWTH_CHECK',
        'DEATH_REPORT',
        'REPLACEMENT',
        'GPS_CHECK',
      ],
      required: true,
    },
    imageCid: {
      type: String,
      required: true,
    },
    metadataCid: {
      type: String,
      default: null,
    },
    latitude: {
      type: Number,
      required: true,
    },
    longitude: {
      type: Number,
      required: true,
    },
    capturedAt: {
      type: Date,
      required: true,
    },
    submittedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

export const TreeEvidence =
  mongoose.models.TreeEvidence || mongoose.model<ITreeEvidence>('TreeEvidence', treeEvidenceSchema);
