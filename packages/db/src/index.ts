import mongoose from "mongoose";

const {DATABASE_URL, DB_NAME} = process.env;

await mongoose.connect(DATABASE_URL || "").catch((error) => {
	console.log("Error connecting to database:", error);
});

const client = mongoose.connection.getClient().db(DB_NAME)	;

export { client };
