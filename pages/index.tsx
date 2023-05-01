import Image from 'next/image'
import { Inter } from 'next/font/google'
import Head from 'next/head'
import { useState } from 'react'
import { Chunk, ChunkedRecipe } from '../types'
import endent from 'endent'


export default function Home() {
  const [query, setQuery] = useState('');
  const [answer, setAnswer] = useState('');
  const [chunks, setChunks] = useState<Chunk[]>([]);
  const [loading, setLoading] = useState(false);

  const handleAnswer = async () => {
    setLoading(true);

    const searchResponse = await fetch('/api/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query})
    });

    if(!searchResponse.ok) {
      setLoading(false);
      throw new Error(searchResponse.statusText)
    }
    
    const results: Chunk[] = await searchResponse.json();
    setChunks(results);
    
    console.log(results);

    const prompt = endent`
    Use the following passages to answer the query: "${query}"
    
    ${results.map((chunk: any) => chunk.content).join("\n\n")}`;
    console.log(prompt);
    
    const answerResponse = await fetch('/api/answer', {
      method: "POST",
      headers: { 
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ prompt })
    });

    if(!answerResponse.ok) {
      setLoading(false);
      throw new Error(answerResponse.statusText);
    }
      
    const data = answerResponse.body;
    
    if(!data) {
      return;
    }


    const reader = data.getReader();
    const decoder = new TextDecoder();
    let done = false;

    while(!done){
      const {value, done: doneReading } = await reader.read();
      done = doneReading;
      const chunkValue = decoder.decode(value);
      setAnswer((prev) => prev + chunkValue);
    }

    setLoading(false);
  };

  return (
    <> 
      <Head>
        <title>Chef GPT</title>
        <meta 
          name="description" 
          content="Generate recipes with a GPT-3 model embedded with recipe data" 
        />
        <meta
          name='viewport'
          content='width=device-width, initial-scale=1'
        />
        <link
          rel='icon'
          href='/favicon.ico'
        />
      </Head>
      <div className='flex flex-col w-[350px]'>
        <input
          className='border border-gray-300 rounded-md p-2'
          type='text'
          placeholder='What do you want to cook?'
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button
          className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'
          onClick={handleAnswer}
        >
          Generate
        </button>

        <div className='mt-4'>{loading? <div>Loading...</div> : 
        <div>{answer}</div>}</div>

      </div>
    </>
  )
}
