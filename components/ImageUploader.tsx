import React, { useRef, useState } from 'react';
import * as tf from '@tensorflow/tfjs';
const classNames = [
  "apple pie",
  "baby back ribs",
  "baklava",
  "beef carpaccio",
  "beef tartare",
  "beet_salad",
  "beignets",
  "bibimbap",
  "bread pudding",
  "breakfast_burrito",
  "bruschetta",
  "caesar salad",
  "cannoli",
  "caprese salad",
  "carrot cake",
  "ceviche",
  "cheesecake",
  "cheese plate",
  "chicken curry",
  "chicken quesadilla",
  "chicken wings",
  "chocolate_cake",
  "chocolate mousse",
  "churros",
  "clam chowder",
  "club sandwich",
  "crab cakes",
  "creme brulee",
  "croque madame",
  "cup cakes",
  "deviled eggs",
  "donuts",
  "dumplings",
  "edamame",
  "eggs benedict",
  "escargots",
  "falafel",
  "filet mignon",
  "fish and chips",
  "foie gras",
  "french fries",
  "french onion_soup",
  "french toast",
  "fried calamari",
  "fried rice",
  "frozen yogurt",
  "garlic bread",
  "gnocchi",
  "greek salad",
  "grilled cheese sandwich",
  "grilled salmon",
  "guacamole",
  "gyoza",
  "hamburger",
  "hot and sour soup",
  "hot_dog",
  "huevos rancheros",
  "hummus",
  "ice cream",
  "lasagna",
  "lobster bisque",
  "lobster roll sandwich",
  "macaroni and cheese",
  "macarons",
  "miso soup",
  "mussels",
  "nachos",
  "omelette",
  "onion_rings",
  "oysters",
  "pad thai",
  "paella",
  "pancakes",
  "panna cotta",
  "peking duck",
  "pho",
  "pizza",
  "pork chop",
  "poutine",
  "prime rib",
  "pulled pork sandwich",
  "ramen",
  "ravioli",
  "red velvet cake",
  "risotto",
  "samosa",
  "sashimi",
  "scallops",
  "seaweed salad",
  "shrimp and grits",
  "spaghetti bolognese",
  "spaghetti carbonara",
  "spring rolls",
  "steak",
  "strawberry shortcake",
  "sushi",
  "tacos",
  "takoyaki",
  "tiramisu",
  "tuna tartare",
  "waffles"
];

const ImageUploader: React.FC<{ setPredictedFood: (food: string) => void }> = ({
  setPredictedFood,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [imageSrc, setImageSrc] = useState<string>('');

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
  
    // Read the uploaded image file
    const img = new Image();
    img.src = URL.createObjectURL(file);
    setImageSrc(img.src);
    img.width = 224;
    img.height = 224;
    img.onload = async () => {
      // Convert the image to a tensor
      let tensor = tf.browser.fromPixels(img).toFloat();
  
      // Normalize the tensor to the range [-1, 1] (assuming your model is trained on this range)
      tensor = tensor.sub(127.5).div(127.5);
  
      // Expand dimensions to create a batch of size 1
      const batched = tensor.expandDims(0);
  
      // Load the model and make a prediction
      const model = await tf.loadLayersModel('/tfjs_model/model.json');
  
      const output = model.predict(batched) as tf.Tensor;
  
      // Process the predictions and find the class with the highest probability
      const highestProbIndex = output.as1D().argMax().dataSync()[0];
      console.log('Predicted class:', highestProbIndex);
      
      // Get the food item name using the predicted class index
      const foodItemName = classNames[highestProbIndex];
      console.log('Predicted food item:', foodItemName);
      // Update the predictedFood state in the parent component
      setPredictedFood(foodItemName);
    };
  };
  

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        ref={inputRef}
        onChange={handleImageUpload}
      />
      {imageSrc && <img src={imageSrc} alt="Uploaded preview" />}
    </div>
  );
};

export default ImageUploader;
