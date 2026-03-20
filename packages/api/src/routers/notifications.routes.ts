import Notification from "@chatapp/db/models/notification.model";
import z from "zod";

import { protectedProcedure } from "../index";

export const notificationsRouter = {
  getAll: protectedProcedure.handler(async ({ context }) => {
    return await Notification.find({ userId: context.session.user.id }).sort({ createdAt: -1 }).lean();
  }),

  getUnread: protectedProcedure.handler(async ({ context }) => {
    return await Notification.find({ 
      userId: context.session.user.id, 
      read: false 
    }).lean();
  }),

  markAsRead: protectedProcedure
    .input(z.object({ id: z.string() }))
    .handler(async ({ context, input }) => {
      await Notification.updateOne(
        { _id: input.id, userId: context.session.user.id },
        { read: true }
      );
      return { success: true };
    }),

  markAllAsRead: protectedProcedure.handler(async ({ context }) => {
    await Notification.updateMany(
      { userId: context.session.user.id, read: false },
      { read: true }
    );
    return { success: true };
  }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .handler(async ({ context, input }) => {
      await Notification.deleteOne({ _id: input.id, userId: context.session.user.id });
      return { success: true };
    }),
};
