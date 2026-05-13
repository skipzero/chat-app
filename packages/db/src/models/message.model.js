import mongoose, {} from "mongoose";
const { Schema, model, models } = mongoose;
const messageSchema = new Schema({
    roomId: { type: String, ref: "Room", required: true },
    senderId: { type: String, required: true },
    content: { type: String, required: true },
    read: { type: Boolean, default: false },
}, {
    collection: "message",
    timestamps: { createdAt: true, updatedAt: false },
});
export const Message = models.Message || model("Message", messageSchema);
