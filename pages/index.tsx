import Image from 'next/image'
import { Inter } from 'next/font/google'
import Head from 'next/head'
import { useState } from 'react'
import { Chunk, ChunkedRecipe } from '../types'
import endent from 'endent'
import { Answer } from '@/components/Answer'
import ImageUploader from '@/components/ImageUploader'
import Navbar from '@/components/Navbar'

export default function Home() {
  const [query, setQuery] = useState('');
  const [answer, setAnswer] = useState('');
  const [chunks, setChunks] = useState<Chunk[]>([]);
  const [loading, setLoading] = useState(false);
  const [foodItemConfirmed, setFoodItemConfirmed] = useState(false);
  const [predictedFood, setPredictedFood] = useState('');

  const handleFoodItemConfirmation = () => {
    setFoodItemConfirmed(true);
    setQuery((prevQuery) => (prevQuery ? `${prevQuery} ${predictedFood}` : predictedFood));
  };
  

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
    How do I cook "${query}". Please include the recipe name, the total time it takes to cook, step by step instructions on how it is cooked and  any nutritional information about the meal:"
    
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
      <div className="top-0 left-0 w-full z-10">
        <Navbar />
      </div>
      <div className="flex justify-center items-center min-h-screen ">
        
        <div className="flex flex-col w-[700px]">
          <div className="flex justify-center mb-4 pt-4">
              <ImageUploader setPredictedFood={setPredictedFood} />
          </div>

          {predictedFood && !foodItemConfirmed && (
          <div className='flex flex-col items-center'>
            <div>
              <p>Predicted food item: {predictedFood}</p>
            </div>
            <div className='mt-2'>
              <button onClick={handleFoodItemConfirmation} className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'>
                Confirm
              </button>
            </div>
          </div>
        )}

          
          <input
            className="border border-gray-300 rounded-md p-2 mb-4"
            type="text"
            placeholder="What do you want to cook?"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={handleAnswer}
          >
            Generate
          </button>

          <div className="mt-4 pb-8">
            {loading ? <div>Loading...</div> : 
            <Answer text={answer} />}
          </div>
        </div>
      </div>
    </>
  )
}
