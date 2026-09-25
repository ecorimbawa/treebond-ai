import { type Document, model, models, Schema, type Types } from "mongoose";

export interface IFarm extends Document {
  owner: Types.ObjectId; // User
  name: string;
  location: {
    province: string;
    city: string;
    district?: string;
    village?: string;
  };
  area: {
    value: number;
    unit: "HA" | "M2";
  };
  status: "ACTIVE" | "INACTIVE";
  createdAt: Date;
  updatedAt: Date;
}

const farmSchema = new Schema<IFarm>(
  {
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true, trim: true },
    location: {
      province: { type: String, required: true, trim: true },
      city: { type: String, required: true, trim: true },
      district: { type: String, trim: true },
      village: { type: String, trim: true },
    },
    area: {
      value: { type: Number, required: true, min: 0 },
      unit: { type: String, enum: ["HA", "M2"], required: true },
    },
    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE"],
      default: "ACTIVE",
    },
  },
  { timestamps: true },
);

export default models.Farm || model<IFarm>("Farm", farmSchema);
