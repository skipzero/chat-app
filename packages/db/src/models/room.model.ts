import { Schema, model } from "mongoose";

const roomsSchema = new Schema(
	{
		_id: { 
			type: Schema.Types.ObjectId, 
			auto: true 
		},
		identifier: { 
			type: String, 
			required: true 
		},
		name: { 
			type: String, 
			required: true 
		},
		members: [{ 
			type: String, 
			ref: "User" 
		}],
		createdBy: { 
			type: String, 
			ref: "User", 
			required: true 
		},
		createdAt: { 
			type: Date, 
			required: true },
		isPublic: { type: Boolean, default: true },
		
	},
	{ collection: "rooms" },
);
																																																																																															
	roomsSchema.index({ name: 1, identifier: 1 }); // For quick lookup by identifier

export const Rooms = model("Rooms", roomsSchema);
