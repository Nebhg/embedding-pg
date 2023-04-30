import Image from 'next/image'
import { Inter } from 'next/font/google'
import Head from 'next/head'
import { useState } from 'react'
import { ChunkedRecipe } from '../types'
const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  const [query, setQuery] = useState('');
  const [answer, setAnswer] = useState('');
  const [chunks, setChunks] = useState<ChunkedRecipe[]>([]);
  const [loading, setLoading] = useState(false);

  const handlleAnswer = async () => {
    const searchResponse = await fetch('/api/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query })
    });

    if(!searchResponse.ok) {
      return;
    }
    const results: ChunkedRecipe[] = await searchResponse.json();
    setChunks(results);
    console.log(results);
  }

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
          onClick={handlleAnswer}
        >
          Generate
        </button>
      </div>
    </>
  )
}
