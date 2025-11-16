import { Schema, model } from "mongoose";

const messageSchema = new Schema(
	{
		_id: { type: String },
		roomId: { type: String, ref: "Room", required: true },
		senderId: { type: String, ref: "User", required: true },
		seenBy: [{ type: String, ref: "User" }],
		private: { type: Boolean, required: true, default: false },
		content: { type: String, required: true },
		createdAt: { type: Date, required: true },
	},
	{ collection: "message" },
);

messageSchema.index({ roomId: 1, createdAt: -1 }); // For fetching messages in a room ordered by creation time
messageSchema.index({ senderId: 1, roomId: 1 }); // For fetching messages by a specific sender in a room

export const Message = model("Message", messageSchema);