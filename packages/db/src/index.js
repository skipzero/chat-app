import { env } from "@chatapp/env/server";
import mongoose from "mongoose";
import { Room } from "./models/room.model";
import { Message } from "./models/message.model";
const { DATABASE_NAME, DATABASE_URL } = env;
await mongoose.connect(DATABASE_URL).catch((error) => {
    console.log("Error connecting to database:", error);
});
const client = mongoose.connection.getClient().db(DATABASE_NAME);
export { client, Room, Message };
