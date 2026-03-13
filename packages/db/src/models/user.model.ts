import { Schema, model } from 'mongoose';

const userSchema = new Schema(
  {
    _id: { type: Schema.Types.ObjectId },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    emailVerified: { type: Boolean, required: true },
    avatar: { type: URL, required: false },
    createdAt: { type: Date, required: true },
    updatedAt: { type: Date, required: true },
  },
  { collection: "user" },
);

const User = model("User", userSchema);

export default User;