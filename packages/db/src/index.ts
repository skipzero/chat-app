import { env } from "@chatapp/env/server";
import mongoose from "mongoose";
import { Room } from "./models/room.model";
import { Message } from "./models/message.model";

await mongoose.connect(env.DATABASE_URL, { dbName: env.DATABASE_NAME }).catch((error) => {
  console.log("Error connecting to database:", error);
});

const client = mongoose.connection.getClient().db(env.DATABASE_NAME);

export { client, Room, Message };