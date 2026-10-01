import mongoose, { type Document, Schema, type Types } from "mongoose";

export interface IProject extends Document {
  name: string;
  slug: string;
  description: string;
  country: string;
  province: string;
  regency: string;
  village: string;
  latitude: number;
  longitude: number;
  areaHectares: number;
  targetTreeCount: number;
  status: "active" | "paused" | "completed" | "archived";
  coverImageCid?: string;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const projectSchema = new Schema<IProject>(
  {
    name: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
    },
    province: {
      type: String,
      required: true,
    },
    regency: {
      type: String,
      required: true,
    },
    village: {
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
    areaHectares: {
      type: Number,
      required: true,
    },
    targetTreeCount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "paused", "completed", "archived"],
      default: "active",
    },
    coverImageCid: {
      type: String,
      default: null,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export const Project =
  mongoose.models.Project || mongoose.model<IProject>("Project", projectSchema);
