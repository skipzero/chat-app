import z from "zod";
import { publicProcedure, protectedProcedure } from "../index";
import { Message } from "@chat-app/db/models/message.model";

export const messageRouter = {
	getAll: publicProcedure.handler(async () => {
		return await Message.find().lean();
	}),

	//TODO: change to lookup by identifier
	getByAuthor: protectedProcedure
	.input(z.object({ author: z.string().min(1) })) 
	.handler(async ({ input }) => {
		return await Message.find({ author: input.author }).lean();
	}),

	create: protectedProcedure
		.input(z.object({ text: z.string().min(1) }))
		.handler(async ({ input }) => {
			const newMessage = await Message.create({ text: input.text });
			return newMessage.toObject();
		}),

	delete: protectedProcedure
		.input(z.object({ id: z.string() }))
		.handler(async ({ input }) => {
			await Message.deleteOne({ id: input.id });
			return { success: true };
		}),
};
