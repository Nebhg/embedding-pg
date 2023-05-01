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
                content: 'You are a helpful assisstant that answers queries about recipes. The following is a conversation with a user about how to make a recipe.'
            },
            {
                role: 'user',
                content: prompt
            }
        ],
        max_tokens: 150,
        temperature: 0.0,
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
                if (event.type === 'event') {
                    const data = event.data;
            
                    if (data === '|DONE|') {
                        controller.close();
                        return;
                    }
            
                    try {
                        const json = JSON.parse(data);
                        const text = json.choices[0].text;
                        const queue = encoder.encode(text);
                        controller.enqueue(queue);
                    } catch (e) {
                        controller.error(e);
                    }
                }
            };
            // Helper function to check if a string is valid JSON
            function isJsonString(str: string) {
                try {
                    JSON.parse(str);
                } catch (e) {
                    return false;
                }
                return true;
            }
        }

    });
    return stream;
};
