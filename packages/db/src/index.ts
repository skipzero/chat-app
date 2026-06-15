// import { env } from "@chatapp/env";
import mongoose from "mongoose";
import { Room } from "./models/room.model";
import { Message } from "./models/message.model";

// const { DATABASE_URL, DATABASE_NAME } = process.env;

await mongoose.connect(process.env.DATABASE_URL!, { dbName: process.env.DATABASE_NAME! }).catch((error) => {
  console.log("Error connecting to database:", error);
});

const client = mongoose.connection.getClient().db(process.env.DATABASE_NAME!);

export { client, Room, Message };