import Chat from "@chatapp/db/models/chat.model";
import z from "zod";

import { publicProcedure } from "../index";

export const chatRouter = {
  getAll: publicProcedure.handler(async () => {
    return await Chat.find().lean();
  }),

  create: publicProcedure
    .input(z.object(
      { 
        text: z.string().min(1)
      }))
    .handler(async ({ input }) => {
      const newChat = await Chat.create({ text: input.text });
      return newChat.toObject();
    }),

  toggle: publicProcedure
    .input(z.object({ id: z.string(), completed: z.boolean() })).handler(async ({ input }) => {
      await Chat.updateOne({ id: input.id }, { completed: input.completed });
      return { success: true };
    }),

  delete: publicProcedure.input(z.object({ id: z.string() })).handler(async ({ input }) => {
    await Chat.deleteOne({ id: input.id });
    return { success: true };
  }),
};
