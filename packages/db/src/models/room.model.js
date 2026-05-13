import mongoose, {} from "mongoose";
const { Schema, model, models } = mongoose;
const roomSchema = new Schema({
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String },
    participants: [{ type: String }],
}, {
    collection: "room",
    timestamps: true,
});
export const Room = models.Room || model("Room", roomSchema);
