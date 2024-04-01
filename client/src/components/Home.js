import { useEffect, useRef, useState } from 'react'
import * as faceapi from 'face-api.js';
import Webcam from 'react-webcam';


const Home = () => {
  const canvasRef = useRef();
  const [imgElement, setImgElement] = useState(null);
  const [imageData, setImageData] = useState(null);
  const [webcamActive, setWebcamActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const webcamRef = useRef(null);

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
      .withFaceExpressions()

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
    setLoading(true); // Set loading to true when image upload starts
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      setImageData(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const toggleWebcam = () => {
    if (webcamActive) {
      captureWebcam(); // Call captureWebcam when toggling off
    } else {
      setWebcamActive(true);
    }
  };

  const captureWebcam = () => {
    setLoading(true)
    const imageSrc = webcamRef.current.getScreenshot();
    setImageData(imageSrc);
    setWebcamActive(false);
  };

  useEffect(() => {
    const loadModels = async () => {
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
          faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
          faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
          faceapi.nets.faceExpressionNet.loadFromUri('/models'),
        ]);
        await handleImage(imageData);
        setLoading(false); // Set loading to false when image processing is completed
      } catch (e) {
        console.log(e);
      }
    };

    loadModels();
  }, [imageData]);

  return (
    <div className='home'>
      <div className="container">
        <div className="image-container">
          {imgElement && <img src={imgElement.src} alt="Uploaded" className="uploaded-image" />}
          <canvas ref={canvasRef} />
        </div>
        <div className="upload-container">
          {/* Conditionally render Webcam */}
        {webcamActive && (
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            videoConstraints={{ facingMode: 'user' }}
          />
        )}
        <button onClick={toggleWebcam} className="action-button">
          {webcamActive ? 'Capture from Webcam' : 'Activate Webcam'}
        </button>

        <label htmlFor="file-upload" className="action-button">
          Upload Image
        </label>
        <input type="file" accept="image/*" id="file-upload" onChange={handleFileUpload} style={{ display: 'none' }} />
        </div>
        {loading && <div className="loading">Loading...</div>}

      </div>
    </div>
  )
}

export default Home