import { Schema, model } from "mongoose";

const userSchema = new Schema(
	{
		_id: { type: String },
		name: { type: String, required: true },
		email: { type: String, required: true, unique: true },
		emailVerified: { type: Boolean, required: true },
		image: { type: String },
		createdAt: { type: Date, required: true },
		updatedAt: { type: Date, required: true },
	},
	{ collection: "user" },
);

const verificationSchema = new Schema(
	{
		_id: { type: String },
		identifier: { type: String, required: true },
		value: { type: String, required: true },
		expiresAt: { type: Date, required: true },
		createdAt: { type: Date },
		updatedAt: { type: Date },
	},
	{ collection: "verification" },
);

const User = model("User", userSchema);
const Verification = model("Verification", verificationSchema);

export { User, Verification };
