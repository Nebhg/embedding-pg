import React, { useRef } from 'react';
import * as tf from '@tensorflow/tfjs';
const classNames = [
  "apple_pie",
  "baby_back_ribs",
  "baklava",
  "beef_carpaccio",
  "beef_tartare",
  "beet_salad",
  "beignets",
  "bibimbap",
  "bread_pudding",
  "breakfast_burrito",
  "bruschetta",
  "caesar_salad",
  "cannoli",
  "caprese_salad",
  "carrot_cake",
  "ceviche",
  "cheesecake",
  "cheese_plate",
  "chicken_curry",
  "chicken_quesadilla",
  "chicken_wings",
  "chocolate_cake",
  "chocolate_mousse",
  "churros",
  "clam_chowder",
  "club_sandwich",
  "crab_cakes",
  "creme_brulee",
  "croque_madame",
  "cup_cakes",
  "deviled_eggs",
  "donuts",
  "dumplings",
  "edamame",
  "eggs_benedict",
  "escargots",
  "falafel",
  "filet_mignon",
  "fish_and_chips",
  "foie_gras",
  "french_fries",
  "french_onion_soup",
  "french_toast",
  "fried_calamari",
  "fried_rice",
  "frozen_yogurt",
  "garlic_bread",
  "gnocchi",
  "greek_salad",
  "grilled_cheese_sandwich",
  "grilled_salmon",
  "guacamole",
  "gyoza",
  "hamburger",
  "hot_and_sour_soup",
  "hot_dog",
  "huevos_rancheros",
  "hummus",
  "ice_cream",
  "lasagna",
  "lobster_bisque",
  "lobster_roll_sandwich",
  "macaroni_and_cheese",
  "macarons",
  "miso_soup",
  "mussels",
  "nachos",
  "omelette",
  "onion_rings",
  "oysters",
  "pad_thai",
  "paella",
  "pancakes",
  "panna_cotta",
  "peking_duck",
  "pho",
  "pizza",
  "pork_chop",
  "poutine",
  "prime_rib",
  "pulled_pork_sandwich",
  "ramen",
  "ravioli",
  "red_velvet_cake",
  "risotto",
  "samosa",
  "sashimi",
  "scallops",
  "seaweed_salad",
  "shrimp_and_grits",
  "spaghetti_bolognese",
  "spaghetti_carbonara",
  "spring_rolls",
  "steak",
  "strawberry_shortcake",
  "sushi",
  "tacos",
  "takoyaki",
  "tiramisu",
  "tuna_tartare",
  "waffles"
];

const ImageUploader: React.FC<{ setPredictedFood: (food: string) => void }> = ({
  setPredictedFood,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
  
    // Read the uploaded image file
    const img = new Image();
    img.src = URL.createObjectURL(file);
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
    </div>
  );
};

export default ImageUploader;
