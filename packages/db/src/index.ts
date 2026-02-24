import { env } from "@chatapp/env/server";
import mongoose from "mongoose";


const { DATABASE_NAME, DATABASE_URL } = env;
await mongoose.connect(DATABASE_URL).catch((error) => {
  console.log("Error connecting to database:", error);
});

const client = mongoose.connection.getClient().db(DATABASE_NAME);

export { client };
