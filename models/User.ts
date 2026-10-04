import mongoose, { type Document, Schema } from "mongoose";

export type UserRole = "sponsor" | "operator" | "verifier" | "admin";

export interface IUser extends Document {
  email: string;
  password: string;
  fullName: string;
  avatarUrl?: string;
  role: UserRole;
  placeholderEmail: boolean;
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
    // Wallet-first sign-ups have no email to give, but `email` is a required
    // unique index — so they get a synthetic one and this flag marks it as
    // not-a-real-address. Defaults to false, which is also what every
    // pre-existing email account reads back as.
    placeholderEmail: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

export const User =
  mongoose.models.User || mongoose.model<IUser>("User", userSchema);
