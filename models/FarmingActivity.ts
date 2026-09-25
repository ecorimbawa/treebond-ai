import { type Document, model, models, Schema, type Types } from "mongoose";

export interface IFarmingActivity extends Document {
  cropCycle: Types.ObjectId;
  type:
    | "SEEDING"
    | "FERTILIZING"
    | "PESTICIDE"
    | "IRRIGATION"
    | "TREATMENT"
    | "OTHER";
  title: string;
  description?: string;
  performedAt: Date;
  materials?: {
    name: string;
    quantity?: number;
    unit?: string;
  }[];
  evidence?: {
    url: string;
    type: "IMAGE" | "DOCUMENT";
  }[];
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const farmingActivitySchema = new Schema<IFarmingActivity>(
  {
    cropCycle: {
      type: Schema.Types.ObjectId,
      ref: "CropCycle",
      required: true,
    },
    type: {
      type: String,
      enum: [
        "SEEDING",
        "FERTILIZING",
        "PESTICIDE",
        "IRRIGATION",
        "TREATMENT",
        "OTHER",
      ],
      required: true,
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    performedAt: { type: Date, required: true },
    materials: [
      {
        _id: false,
        name: { type: String, required: true, trim: true },
        quantity: { type: Number, min: 0 },
        unit: { type: String, trim: true },
      },
    ],
    evidence: [
      {
        _id: false,
        url: { type: String, required: true, trim: true },
        type: { type: String, enum: ["IMAGE", "DOCUMENT"], required: true },
      },
    ],
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true },
);

export default models.FarmingActivity ||
  model<IFarmingActivity>("FarmingActivity", farmingActivitySchema);
