import mongoose, { type Document, Schema } from "mongoose";

export type UserRole = "sponsor" | "operator" | "verifier" | "admin";

export interface IUser extends Document {
  email: string;
  password: string;
  fullName: string;
  avatarUrl?: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    fullName: {
      type: String,
      required: true,
    },
    avatarUrl: {
      type: String,
      default: null,
    },
    role: {
      type: String,
      enum: ["sponsor", "operator", "verifier", "admin"],
      default: "sponsor",
    },
  },
  {
    timestamps: true,
  },
);

export const User =
  mongoose.models.User || mongoose.model<IUser>("User", userSchema);
