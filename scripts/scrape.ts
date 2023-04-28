import { encode } from "gpt-3-encoder";
import fs from "fs";

type Recipe = {
  title: string;
  total_time: number;
  yields: string;
  ingredients: string[];
  nutrition: {
    calories: string;
    carbohydrateContent: string;
    cholesterolContent: string;
    fiberContent: string;
    proteinContent: string;
    saturatedFatContent: string;
    sodiumContent: string;
    sugarContent: string;
    fatContent: string;
    unsaturatedFatContent: string;
  };
  instructions_list: string[];
  image: string;
};

type Chunk = {
  recipe_title: string;
  content: string;
  content_tokens: number;
  embedding: any[];
};

type ChunkedRecipe = Recipe & {
  chunks: Chunk[];
};

const getChunks = async (recipe: Recipe): Promise<ChunkedRecipe> => {
  const { title, total_time, yields, ingredients, nutrition, instructions_list, image } = recipe;

  // Concatenate all the data into a single string
  const content = `${title}\n\nTotal Time: ${total_time} minutes\nYields: ${yields}\n\nIngredients:\n${ingredients.join(
    "\n"
  )}\n\nInstructions:\n${instructions_list.join("\n")}\n\nNutrition:\nCalories: ${nutrition.calories}\nCarbohydrate Content: ${
    nutrition.carbohydrateContent
  }\nCholesterol Content: ${nutrition.cholesterolContent}\nFiber Content: ${nutrition.fiberContent}\nProtein Content: ${
    nutrition.proteinContent
  }\nSaturated Fat Content: ${nutrition.saturatedFatContent}\nSodium Content: ${nutrition.sodiumContent}\nSugar Content: ${
    nutrition.sugarContent
  }\nFat Content: ${nutrition.fatContent}\nUnsaturated Fat Content: ${nutrition.unsaturatedFatContent}\n\nImage: ${image}`;

  const chunk: Chunk = {
    recipe_title: title,
    content,
    content_tokens: encode(content).length,
    embedding: [],
  };

  const chunkedRecipe: ChunkedRecipe = {
    ...recipe,
    chunks: [chunk],
  };

  return chunkedRecipe;
};


const printRandomRecipe = (chunkedRecipes: ChunkedRecipe[]): void => {
  const randomIndex = Math.floor(Math.random() * chunkedRecipes.length);
  const randomRecipe = chunkedRecipes[randomIndex];
  const randomRecipeContent = randomRecipe.chunks[0].content;

  console.log(randomRecipeContent);
  console.log("\nToken Count:", randomRecipe.chunks[0].content_tokens);
};


(async () => {
  const recipeDataPath = "scripts/recipes.json";
  const recipeData: Recipe[] = JSON.parse(fs.readFileSync(recipeDataPath, "utf-8"));
  let chunkedRecipes: ChunkedRecipe[] = [];

  for (const recipe of recipeData) {
    const chunkedRecipe = await getChunks(recipe);
    chunkedRecipes.push(chunkedRecipe);
  }

  const chunkedRecipesPath = "scripts/chunkedRecipes.json";
  fs.writeFileSync(chunkedRecipesPath, JSON.stringify(chunkedRecipes));

  // Print a random recipe from the chunkedRecipes array
  printRandomRecipe(chunkedRecipes);
})();
