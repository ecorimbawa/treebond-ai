import mongoose, { type Document, Schema, type Types } from "mongoose";

export type NotificationType =
  | "tree_sponsored"
  | "verification_approved"
  | "verification_rejected"
  | "monitoring_update"
  | "health_warning"
  | "status_changed";

export interface INotification extends Document {
  userId: Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  treeId?: Types.ObjectId;
  verificationId?: Types.ObjectId;
  read: boolean;
  createdAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: [
        "tree_sponsored",
        "verification_approved",
        "verification_rejected",
        "monitoring_update",
        "health_warning",
        "status_changed",
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    treeId: {
      type: Schema.Types.ObjectId,
      ref: "Tree",
      default: null,
    },
    verificationId: {
      type: Schema.Types.ObjectId,
      ref: "Verification",
      default: null,
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

export const Notification =
  mongoose.models.Notification ||
  mongoose.model<INotification>("Notification", notificationSchema);
