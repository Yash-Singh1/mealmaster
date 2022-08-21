import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
} from "../trpc";

export const userRouter = createTRPCRouter({
  self: protectedProcedure
    .input(z.object({ token: z.string().min(1) }))
    .query(({ ctx }) => {
      return ctx.user;
    }),
});
