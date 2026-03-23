import Room from "@chatapp/db/models/rooms.model";
import z from "zod";

import { protectedProcedure } from "../index";

export const roomRouter = {
  getAll: protectedProcedure.handler(async () => {
    return await Room.find().lean();
  }),

  create: protectedProcedure
    .input(z.object({ text: z.string().min(1) }))
    .handler(async ({ input }) => {
      const newRoom = await Room.create({ text: input.text });
      return newRoom.toObject();
    }),

  // toggle: publicProcedure
  //   .input(z.object({ id: z.string(), completed: z.boolean() }))
  //   .handler(async ({ input }) => {
  //     await Room.updateOne({ id: input.id }, { completed: input.completed });
  //     return { success: true };
  //   }),

  delete: protectedProcedure.input(z.object({ id: z.number() })).handler(async ({ input }) => {
    await Room.deleteOne({ id: input.id });
    return { success: true }; 
  }),
};
