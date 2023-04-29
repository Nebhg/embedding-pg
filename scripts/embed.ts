import { Recipe, Chunk, ChunkedRecipe } from "@/types";
import { loadEnvConfig } from "@next/env";
import { Configuration, OpenAIApi } from "openai";
import fs from "fs";
import { createClient } from "@supabase/supabase-js";

loadEnvConfig("");

const generateEmbeddings = async (chunkedRecipes: ChunkedRecipe[]) => {
    const configuration = new Configuration({
        apiKey: process.env.OPENAI_API_KEY,
      });
    const openai = new OpenAIApi(configuration);

    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!, 
        process.env.SUPABASE_SERVICE_ROLE_KEY!);

    for(let i = 0; i < chunkedRecipes.length; i++) {
        const recipe =chunkedRecipes[i];

        for(let j = 0; j < recipe.chunks.length; j++) {
            const chunk = recipe.chunks[j];
            const embeddingResponse = await openai.createEmbedding({
                model: "text-embedding-ada-002",
                input: chunk.content,
            })

            const [{embedding}] = embeddingResponse.data.data;

            const {data, error} = await supabase.from("recipe_gen").
            insert({
                recipe_title: recipe.title, 
                content: chunk.content, 
                content_tokens: chunk.content_tokens,
                embedding
            })
            .select("*");
            if(error) {
                console.log(error);
            } else {
                console.log('saved', i, j);
            }

            await new Promise(r => setTimeout(r, 300));
        }
    }
};

(async () => {
  const json: ChunkedRecipe[] = JSON.parse(fs.readFileSync("scripts/chunkedRecipes.json", "utf-8"));

  await generateEmbeddings(json);
})();
