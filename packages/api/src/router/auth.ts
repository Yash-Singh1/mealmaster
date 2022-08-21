import { TRPCError } from "@trpc/server";
import * as bcrypt from "bcryptjs";
import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
  type createInnerTRPCContext,
} from "../trpc";

async function generateSession(
  ctx: ReturnType<typeof createInnerTRPCContext>,
  userId: string,
) {
  const token = [1, 2, 3]
    .map(() => Math.random().toString(36).substring(2, 15))
    .join("");

  await ctx.prisma.session.create({
    data: {
      userId,
      sessionToken: token,
      expires: new Date(1893456000000), // 2030
    },
  });

  return token;
}

export const authRouter = createTRPCRouter({
  message: publicProcedure.query(() => {
    return {};
  }),

  verify: protectedProcedure
    .input(z.object({ token: z.string().min(1) }))
    .query(() => true),

  signup: publicProcedure
    .input(
      z.object({
        name: z.string().min(1),
        email: z.string().email(),
        password: z.string().min(1),
        height: z.number().int().min(1),
        weight: z.number().int().min(1),
        age: z.number().min(1),
        sports: z.number().int().min(0).max(4),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const constant = 524.5;
      let activity = 0;
      switch (input.sports) {
        case 0:
          activity = 1;
          break;
        case 1:
          activity = 1.15;
          break;
        case 2:
          activity = 1.33;
          break;
        case 3:
          activity = 1.46;
          break;
        case 4:
          activity = 1.67;
          break;
      }
      const calories =
        activity *
        (input.weight * 10 + input.height * 6.25 - input.age * 5 + constant);
      const newUser = await ctx.prisma.user.create({
        data: {
          name: input.name,
          email: input.email,
          height: input.height,
          weight: input.weight,
          age: input.age,
          sports: input.sports,
          calories: Math.round(calories),
          carbs: Math.round((calories * 11) / 80),
          fat: Math.round(calories / 30),
          protein: Math.round(calories / 20),
          password: await bcrypt.hash(input.password, 10),
        },
      });
      const session = await generateSession(ctx, newUser.id);
      return { session };
    }),

  login: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userFound = await ctx.prisma.user.findUnique({
        where: {
          email: input.email,
        },
      });
      if (!userFound) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }
      if (await bcrypt.compare(input.password, userFound.password)) {
        const session = await generateSession(ctx, userFound.id);
        return { session };
      }
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Incorrect password",
      });
    }),
});
