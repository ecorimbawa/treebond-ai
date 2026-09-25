import { type Document, model, models, Schema } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  role: "FARMER" | "VERIFIER" | "BUYER" | "ADMIN";
  walletAddress?: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    role: {
      type: String,
      enum: ["FARMER", "VERIFIER", "BUYER", "ADMIN"],
      required: true,
    },
    walletAddress: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      sparse: true,
    },
  },
  { timestamps: true },
);

export default models.User || model<IUser>("User", userSchema);
