import { useEffect, useRef, useState } from 'react'
import * as faceapi from 'face-api.js';
import Webcam from 'react-webcam';


const Home = () => {
  const canvasRef = useRef();
  const [imgElement, setImgElement] = useState(null);
  const [imageData, setImageData] = useState(null);
  const [webcamActive, setWebcamActive] = useState(false);
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
      .withAgeAndGender()

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

    resized.forEach((detection) => {
      const box = detection.detection.box;
      const drawBox = new faceapi.draw.DrawBox(box, {
        label: Math.round(detection.age) + " yeard old " + detection.gender,
      });
      drawBox.draw(canvasRef)
    })

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

  const toggleWebcam = () => {
    if (webcamActive) {
      captureWebcam(); // Call captureWebcam when toggling off
    } else {
      setWebcamActive(true);
    }
  };

  const captureWebcam = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setImageData(imageSrc);
    setWebcamActive(false);
  };

  useEffect(() => {
    const loadModels = () => {
      Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
        faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
        faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
        faceapi.nets.faceExpressionNet.loadFromUri('/models'),
        faceapi.nets.ageGenderNet.loadFromUri('/models')
      ])
        .then(() => handleImage(imageData))
        .catch((e) => console.log(e));
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
      </div>
    </div>
  )
}

export default Home