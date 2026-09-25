import { type Document, model, models, Schema, type Types } from "mongoose";

export interface IHarvest extends Document {
  cropCycle: Types.ObjectId;
  farmer: Types.ObjectId;
  batchCode: string;
  claimedQuantity: {
    value: number;
    unit: "KG";
  };
  harvestedAt: Date;
  status:
    | "DRAFT"
    | "PENDING_VERIFICATION"
    | "VERIFIED"
    | "REJECTED"
    | "TOKENIZED";
  createdAt: Date;
  updatedAt: Date;
}

const harvestSchema = new Schema<IHarvest>(
  {
    cropCycle: {
      type: Schema.Types.ObjectId,
      ref: "CropCycle",
      required: true,
    },
    farmer: { type: Schema.Types.ObjectId, ref: "User", required: true },
    batchCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    claimedQuantity: {
      value: { type: Number, required: true, min: 0 },
      unit: { type: String, enum: ["KG"], default: "KG", required: true },
    },
    harvestedAt: { type: Date, required: true },
    status: {
      type: String,
      enum: [
        "DRAFT",
        "PENDING_VERIFICATION",
        "VERIFIED",
        "REJECTED",
        "TOKENIZED",
      ],
      default: "DRAFT",
    },
  },
  { timestamps: true },
);

export default models.Harvest || model<IHarvest>("Harvest", harvestSchema);
