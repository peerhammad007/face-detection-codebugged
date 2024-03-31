import { useEffect, useRef, useState } from 'react'
import * as faceapi from 'face-api.js';
import Webcam from 'react-webcam';


const Home = () => {
  const canvasRef = useRef();
  const [imgElement, setImgElement] = useState(null);

  const [imageData, setImageData] = useState(null);

  const handleImage = async (imageData) => {
    if (imageData) {
      let img;
  
      if (typeof imageData === 'string') {
        // If imageData is a data URL string (file upload)
        const blobFromDataUrl = await fetch(imageData).then((res) => res.blob());
        img = await faceapi.bufferToImage(blobFromDataUrl);
        setImgElement(img);
      } else {
        img = await faceapi.bufferToImage(imageData);
        setImgElement(img);
      }

    const detections = await faceapi
      .detectAllFaces(img, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceExpressions();

    console.log(detections);

    const canvas = faceapi.createCanvasFromMedia(img);
    canvasRef.current.innerHTML = '';
    canvasRef.current.appendChild(canvas);

    faceapi.matchDimensions(canvasRef.current, {
      width: 600,
      height: 400,
    })
    const resized = faceapi.resizeResults(detections, {
      width: 600,
      height: 400,
    });
    faceapi.draw.drawDetections(canvasRef.current, resized);
    faceapi.draw.drawFaceExpressions(canvasRef.current, resized);
    faceapi.draw.drawFaceLandmarks(canvasRef.current, resized);
    }
  };


  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      setImageData(reader.result);
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    const loadModels = () => {
      Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
        faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
        faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
        faceapi.nets.faceExpressionNet.loadFromUri('/models'),
      ])
        .then(() => handleImage(imageData))
        .catch((e) => console.log(e));
    };

    loadModels();
  }, [imageData]);

  return (
    <div className='home'>
      <div className="image-container">
        {/* Render the uploaded image */}
        {imgElement && <img src={imgElement.src} alt="Uploaded" className="uploaded-image" />}
        <canvas ref={canvasRef} height='600' width='400' />
      </div>

      {/* File Upload */}
      <input type="file" accept="image/*" onChange={handleFileUpload} />

    </div>
  )
}

export default Home