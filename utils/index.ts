import {createClient} from "@supabase/supabase-js";
import { ParsedEvent, ReconnectInterval, createParser } from "eventsource-parser";
import { Stream } from "stream";

export const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const OpenAIStream = async (prompt: string) => {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.OPENAI_API_KEY!}`,
        },
        body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [
            {
                role: 'system',
                content: 'You are a helpful assisstant that answers queries using embedded recipe data. Use the text provided as a guide on how recipes should be layed out, do not copy word for word. In your response include the name of the recipe, a list of ingredients, instructions on how to cook the dish and any nutritional information.'
            },
            {
                role: 'user',
                content: prompt
            }
        ],
        max_tokens: 500,
        temperature: 0.1,
        stream: true
    })
    });
    
    if(response.status !== 200) {
        throw new Error("OpenAI API Error");
    }

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const stream = new ReadableStream({
        async start(controller) {
            const onParse = (event: ParsedEvent | ReconnectInterval) => {
                if(event.type === 'event') 
                {
                    const data = event.data
                    
                    if(data === '|DONE|'){
                        controller.close();
                        return;
                    }

                    try{
                        const json = JSON.parse(data);
                        const text = json.choices[0].delta.content;
                        const queue = encoder.encode(text);
                        controller.enqueue(queue);
                    } catch(e) {
                        controller.error(e);
                    }
                }  
            };
            
            const parser = createParser(onParse);

            for await (const chunk of response.body as any) {
                parser.feed(decoder.decode(chunk));
            }
        }

    });
    return stream;
};
