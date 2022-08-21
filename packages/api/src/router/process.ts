import { TRPCError } from "@trpc/server";
import * as openai from "openai";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "../trpc";

export const processRouter = createTRPCRouter({
  openai: protectedProcedure
    .input(z.object({ token: z.string().min(1), planId: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const plan = await ctx.prisma.mealPlan.findUnique({
        where: {
          id: input.planId,
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
          message: "Unauthorized to access plan",
        });
      }

      if (
        plan.recommendation &&
        plan.recommendationAt &&
        plan.updatedAt <= plan.recommendationAt
      ) {
        return plan.recommendation;
      }

      const actual = {
        calories: 0,
        fat: 0,
        protein: 0,
        carbs: 0,
      };
      plan.meals.forEach((meal) => {
        actual.calories += meal.calories;
        actual.fat += meal.fat;
        actual.protein += meal.protein;
        actual.carbs += meal.carbs;
      });

      const required = {
        calories: ctx.user.calories,
        fat: ctx.user.fat,
        protein: ctx.user.protein,
        carbs: ctx.user.carbs,
      };

      const promptNeeds = (
        Object.keys(required) as (keyof typeof required & keyof typeof actual)[]
      )
        .map((key) => {
          if (actual[key] > 1.075 * required[key]) {
            return `low ${key}`;
          } else if (actual[key] < 0.925 * required[key]) {
            return `high ${key}`;
          }
        })
        .filter((portion) => !!portion)
        .join(", ");

      const configuration = new openai.Configuration({
        apiKey: process.env.OPENAI_APP_KEY,
      });
      const OpenAI = new openai.OpenAIApi(configuration);
      const completion = await OpenAI.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "You are a helpful assistant that gives users a list of ingredients and recipes to eat based on their provided constraints.",
          },
          {
            role: "user",
            content:
              "What should someone eat if they need high protein in their diet?",
          },
          { role: "assistant", content: "Eat high protein foods." },
          {
            role: "user",
            content:
              "What should someone eat if they need low fat in their diet?",
          },
          { role: "assistant", content: "Eat low fat foods." },
          {
            role: "user",
            content: `If a person needs ${promptNeeds} in their diet, what are 15 foods they should be eating?`,
          },
          {
            role: "user",
            content: "What are 5 recipes can they make with those ingredients?",
          },
        ],
      });

      await ctx.prisma.mealPlan.update({
        where: {
          id: plan.id,
        },
        data: {
          recommendation: completion.data.choices[0]!.message!.content,
          recommendationAt: new Date(),
        },
      });

      return completion.data.choices[0]!.message!.content;
    }),
});
