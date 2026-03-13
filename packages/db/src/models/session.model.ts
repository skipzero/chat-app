import { Schema, model } from 'mongoose';

const sessionSchema = new Schema(
  {
    _id: { type: Schema.Types.ObjectId },
    expiresAt: { type: Date, required: true },
    token: { type: String, required: true, unique: true },
    createdAt: { type: Date, required: true },
    updatedAt: { type: Date, required: true },
    ipAddress: { type: String },
    userAgent: { type: String },
    userId: { type: String, ref: "User", required: true },
  },
  { collection: "session" },
);

const Session = model("Session", sessionSchema);

export default Session;