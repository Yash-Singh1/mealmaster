import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "../trpc";

export const scheduleRouter = createTRPCRouter({
  getAll: protectedProcedure
    .input(z.object({ token: z.string().min(1) }))
    .query(async ({ ctx }) => {
      const schedules = await ctx.prisma.reminder.findMany({
        where: {
          userId: ctx.user.id,
        },
      });

      return schedules;
    }),

  create: protectedProcedure
    .input(
      z.object({
        token: z.string().min(1),
        name: z.string().min(1),
        time: z.date(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const schedule = await ctx.prisma.reminder.create({
        data: {
          title: input.name,
          time: input.time,
          userId: ctx.user.id,
        },
      });

      return schedule;
    }),
});
