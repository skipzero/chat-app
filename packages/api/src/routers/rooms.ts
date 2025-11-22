import z from "zod";
import { publicProcedure } from "../index";
import { Rooms } from "@chat-app/db/models/room.model";

export const roomsRouter = {
  getAll: publicProcedure.handler(async () => {
    return await Rooms.find().lean();
  }),

  create: publicProcedure
    .input(z.object({ text: z.string().min(1) }))
    .handler(async ({ input }) => {
      const newMessage = await Rooms.create({ text: input.text });
      return newMessage.toObject();
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .handler(async ({ input }) => {
      await Rooms.deleteOne({ id: input.id });
      return { success: true };
    }),
};
