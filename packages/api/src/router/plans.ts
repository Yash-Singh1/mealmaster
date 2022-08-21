import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "../trpc";

export const plansRouter = createTRPCRouter({
  self: protectedProcedure
    .input(z.object({ token: z.string().min(1) }))
    .query(async ({ ctx }) => {
      const user = await ctx.prisma.user.findUnique({
        where: {
          id: ctx.user.id,
        },
        include: {
          mealPlans: true,
        },
      });

      return user;
    }),

  byId: protectedProcedure
    .input(z.object({ token: z.string().min(1), id: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const plan = await ctx.prisma.mealPlan.findUnique({
        where: {
          id: input.id,
        },
        include: {
          meals: true,
        },
      });

      if (!plan) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Plan not found",
        });
      }

      if (plan.userId !== ctx.user.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "User does not own this plan",
        });
      }

      return plan;
    }),

  createMeal: protectedProcedure
    .input(
      z.object({
        token: z.string().min(1),
        planId: z.string().min(1),
        name: z.string().min(1),
        servings: z.number().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // TODO: ensure plan is from the user

      const call = (
        (await (
          await fetch(
            `https://api.edamam.com/api/food-database/v2/parser?app_id=${process.env.FOOD_APP_ID}&app_key=${process.env.FOOD_APP_KEY}&ingr=${input.name}`,
          )
        ).json()) as {
          parsed: {
            0: {
              food: {
                label: string;
                nutrients: {
                  ENERC_KCAL: number;
                  FAT: number;
                  CHOCDF: number;
                  PROCNT: number;
                };
                image: string;
              };
            };
          };
        }
      ).parsed[0].food;

      await ctx.prisma.meal.create({
        data: {
          name: call.label,
          mealPlanId: input.planId,
          calories: call.nutrients.ENERC_KCAL * (input.servings / 100),
          fat: call.nutrients.FAT * (input.servings / 100),
          carbs: call.nutrients.CHOCDF * (input.servings / 100),
          protein: call.nutrients.PROCNT * (input.servings / 100),
          image: call.image,
          time: 0,
        },
      });

      await ctx.prisma.mealPlan.update({
        where: {
          id: input.planId,
        },
        data: {
          updatedAt: new Date(),
        },
      });
    }),

  createPlan: protectedProcedure
    .input(z.object({ token: z.string().min(1), name: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.mealPlan.create({
        data: {
          name: input.name,
          userId: ctx.user.id,
        },
      });
    }),
});
