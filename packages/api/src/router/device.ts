import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "../trpc";

export const deviceRouter = createTRPCRouter({
  exists: protectedProcedure
    .input(z.object({ token: z.string().min(1), device: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const device = await ctx.prisma.device.findUnique({
        where: {
          pushToken: input.device,
        },
      });

      return device !== null;
    }),
  register: protectedProcedure
    .input(z.object({ token: z.string().min(1), device: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const device = await ctx.prisma.device.create({
        data: {
          pushToken: input.device,
          user: {
            connect: {
              id: ctx.user.id,
            },
          },
        },
      });

      return device;
    }),

  unregister: protectedProcedure
    .input(z.object({ token: z.string().min(1), device: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const device = await ctx.prisma.device.delete({
        where: {
          pushToken: input.device,
        },
      });

      return device;
    }),
});
