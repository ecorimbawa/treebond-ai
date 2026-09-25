import { type Document, model, models, Schema, type Types } from "mongoose";

export interface ICropCycle extends Document {
  farm: Types.ObjectId;
  farmer: Types.ObjectId;
  commodity: {
    name: string;
    variety?: string;
  };
  plantedAt: Date;
  expectedHarvestAt?: Date;
  status:
    | "PLANNED"
    | "GROWING"
    | "READY_TO_HARVEST"
    | "HARVESTED"
    | "CANCELLED";
  createdAt: Date;
  updatedAt: Date;
}

const cropCycleSchema = new Schema<ICropCycle>(
  {
    farm: { type: Schema.Types.ObjectId, ref: "Farm", required: true },
    farmer: { type: Schema.Types.ObjectId, ref: "User", required: true },
    commodity: {
      name: { type: String, required: true, trim: true },
      variety: { type: String, trim: true },
    },
    plantedAt: { type: Date, required: true },
    expectedHarvestAt: { type: Date },
    status: {
      type: String,
      enum: [
        "PLANNED",
        "GROWING",
        "READY_TO_HARVEST",
        "HARVESTED",
        "CANCELLED",
      ],
      default: "PLANNED",
    },
  },
  { timestamps: true },
);

export default models.CropCycle ||
  model<ICropCycle>("CropCycle", cropCycleSchema);
