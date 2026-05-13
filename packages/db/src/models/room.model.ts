import mongoose, { type Model } from "mongoose";

interface RoomDocument {
  name: string;
  slug: string;
  description?: string;
  participants: string[];
}

const { Schema, model, models } = mongoose;

const roomSchema = new Schema<RoomDocument>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String },
    participants: [{ type: String }],
  },
  {
    collection: "room",
    timestamps: true,
  },
);

export const Room: Model<RoomDocument> =
  (models.Room as Model<RoomDocument>) || model<RoomDocument>("Room", roomSchema);
