import { Schema, model, models, type Document, Types } from "mongoose";

export interface ISession extends Document {
  userId: Types.ObjectId;
  accessTokenHash: string;
  refreshTokenHash: string;
  expiresAt: Date;
  revoked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SessionSchema = new Schema<ISession>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    accessTokenHash: {
      type: String,
      required: true,
    },
    refreshTokenHash: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    revoked: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

const Session = models.Session || model<ISession>("Session", SessionSchema);

export default Session;
