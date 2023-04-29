export type Recipe = {
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
  
  export type Chunk = {
    recipe_title: string;
    content: string;
    content_tokens: number;
    embedding: any[];
  };
  
  export type ChunkedRecipe = Recipe & {
    chunks: Chunk[];
  };