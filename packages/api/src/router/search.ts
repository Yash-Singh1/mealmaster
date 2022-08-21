import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "../trpc";

type RecipeSearchResponse = {
  hits: {
    recipe: {
      url: string;
      uri: string;
      label: string;
      yield: number;
      image: string;
      totalNutrients: {
        ENERC_KCAL: { quantity: number };
        FAT: { quantity: number };
        CHOCDF: { quantity: number };
        PROCNT: { quantity: number };
      };
    };
  }[];
  _links: {
    next: {
      href: string;
    };
  };
};

// TODO: pagination
export const searchRouter = createTRPCRouter({
  search: protectedProcedure
    .input(z.object({ token: z.string().min(1), query: z.string().min(1) }))
    .query(async ({ input }) => {
      const results = (await fetch(
        `https://api.edamam.com/api/recipes/v2/?app_key=${process.env.RECIPE_APP_KEY}&app_id=${process.env.RECIPE_APP_ID}&type=public&q=${input.query}`,
      ).then((response) => response.json())) as RecipeSearchResponse;

      return results.hits.map((hit) => ({
        url: hit.recipe.url,
        id: hit.recipe.uri.split("#recipe_")[1],
        name: hit.recipe.label,
        image: hit.recipe.image,
        calories: Math.round(hit.recipe.totalNutrients.ENERC_KCAL.quantity) / hit.recipe.yield,
        fat: Math.round(hit.recipe.totalNutrients.FAT.quantity) / hit.recipe.yield,
        carbs: Math.round(hit.recipe.totalNutrients.CHOCDF.quantity) / hit.recipe.yield,
        protein: Math.round(hit.recipe.totalNutrients.PROCNT.quantity) / hit.recipe.yield,
      }));
    }),
});
