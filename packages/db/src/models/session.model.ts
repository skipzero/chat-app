import { Schema, model } from "mongoose";

const sessionSchema = new Schema(
	{
		_id: { type: String },
		expiresAt: { type: Date, required: true },
		token: { type: String, required: true, unique: true },
		createdAt: { 
			type: Date,
			default: Date.now,
			expires: 60 * 5, // 5 minutes
			required: true 
		},
		ipAddress: { type: String },
		userAgent: { type: String },
		userId: { type: String, ref: "User", required: true },
		
	},
	{ collection: "session" },
);

export const Session = model("Session", sessionSchema);