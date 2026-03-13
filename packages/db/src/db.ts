import mongoose from 'mongoose';
import { env } from '@chatapp/config/env';

const { DATABASE_URL, DATABASE_NAME } = env;

const MONGO_URI = `${DATABASE_URL}/${DATABASE_NAME}`


export async function connectToDatabase() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error}`);
    process.exit(1);
  }
} 
