import { model, Schema } from "mongoose";

const accountSchema = new Schema(
	{
		_id: { type: String },
		accountId: { type: String, required: true },
		providerId: { type: String, required: true },
		userId: { type: String, ref: "User", required: true },
		idToken: { type: String },
		role: { type: String },
		password: { type: String },
		createdAt: { type: Date, required: true },
		updatedAt: { type: Date, required: true },
	},
	{ collection: "account" },
);

export const Account = model("Account", accountSchema);