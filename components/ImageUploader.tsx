import React, { useRef } from 'react';
import * as tf from '@tensorflow/tfjs';

const ImageUploader: React.FC = () => {
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
