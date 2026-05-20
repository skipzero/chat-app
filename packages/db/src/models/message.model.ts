import mongoose, { type Model } from "mongoose";

interface MessageDocument {
  roomId: string;
  senderId: string;
  senderName: string;
  content: string;
  read: boolean;
}

const { Schema, model, models } = mongoose;

const messageSchema = new Schema<MessageDocument>(
  {
    roomId: { type: String, ref: "Room", required: true },
    senderId: { type: String, required: true },
    senderName: { type: String, required: true },
    content: { type: String, required: true },
    read: { type: Boolean, default: false },
  },
  {
    collection: "message",
    timestamps: { createdAt: true, updatedAt: false },
  },
);

export const Message: Model<MessageDocument> =
  (models.Message as Model<MessageDocument>) || model<MessageDocument>("Message", messageSchema);
