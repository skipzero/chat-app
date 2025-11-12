import mongoose from "mongoose";
import z from "zod";

const { Schema, model } = mongoose;

const userSchema = new Schema(
	{
		_id: { type: String },
		username: { type: String, required: true, unique: true },
		name: { type: String, required: true, unique: true },
		email: { type: String, required: true, unique: true },
		emailVerified: { type: Boolean, required: true },
		role: { type: String, required: true, enum: ["user", "admin"], default: "user" },
		image: { type: String },
		createdAt: { type: Date, required: true },
		updatedAt: { type: Date, required: true },
		isOnline: { type: Boolean, required: true, default: false },
	},
	{ collection: "user" },
);

userSchema.index({ username: 1 }); // For quick lookup by username
userSchema.index({ email: 1 }); // For quick lookup by email

const sessionSchema = new Schema(
	{
		_id: { type: String },
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

const accountSchema = new Schema(
	{
		_id: { type: String },
		accountId: { type: String, required: true },
		providerId: { type: String, required: true },
		userId: { type: String, ref: "User", required: true },
		accessToken: { type: String },
		refreshToken: { type: String },
		idToken: { type: String },
		accessTokenExpiresAt: { type: Date },
		refreshTokenExpiresAt: { type: Date },
		scope: { type: String },
		password: { type: String },
		createdAt: { type: Date, required: true },
		updatedAt: { type: Date, required: true },
	},
	{ collection: "account" },
);

accountSchema.index({ providerId: 1, accountId: 1 }); // For quick lookup by provider and account ID

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
const Session = model("Session", sessionSchema);
const Account = model("Account", accountSchema);
const Verification = model("Verification", verificationSchema);

export { User, Session, Account, Verification};
