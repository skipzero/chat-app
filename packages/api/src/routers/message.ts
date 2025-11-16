import z from "zod";
import { publicProcedure } from "../index";
import { Message } from "@tempChatApp/db/models/message.model";

export const messageRouter = {
	getAll: publicProcedure.handler(async () => {
		return await Message.find().lean();
	}),

	create: publicProcedure
		.input(z.object({ text: z.string().min(1) }))
		.handler(async ({ input }) => {
			const newMessage = await Message.create({ text: input.text });
			return newMessage.toObject();
		}),

	delete: publicProcedure
		.input(z.object({ id: z.string() }))
		.handler(async ({ input }) => {
			await Message.deleteOne({ id: input.id });
			return { success: true };
		}),
};
