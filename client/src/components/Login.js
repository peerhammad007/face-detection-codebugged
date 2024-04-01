import React, { useRef, useState, useEffect, useContext } from 'react';
import { UserContext } from '../context/UserContext';
import { Navigate } from 'react-router-dom';
import * as faceapi from 'face-api.js';
import BASE_URL from '../config';

const Login = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false); // State variable for loading
  const [modelsLoaded, setModelsLoaded] = useState(false); // State variable to track model loading
  const [redirect, setRedirect] = useState(false);
  const { setUserInfo } = useContext(UserContext);
  
  const videoRef = useRef();
  const canvasRef = useRef();

  useEffect(() => {
    const loadModels = async () => {
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
          faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
          faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
          faceapi.nets.faceExpressionNet.loadFromUri('/models'),
        ]);
        setModelsLoaded(true); // Set modelsLoaded to true when all models are loaded
      } catch (error) {
        console.error('Error loading models:', error);
      }
    };

    loadModels();
  }, []);

  const startVideo = () => {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        videoRef.current.srcObject = stream;
      })
      .catch((err) => console.error(err));
  };

  const loginUser = async () => {
    if (!modelsLoaded) {
      console.warn('Models are not loaded yet. Please wait.');
      return;
    }
    setLoading(true); // Set loading to true when registration starts
    const detections = await faceapi
      .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (detections) {
      const faceDescriptor = Array.from(detections.descriptor);
      // console.log(faceDescriptor)
      try {
        const response = await fetch(`${BASE_URL}/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, faceDescriptor: Array.from(faceDescriptor) }),
        });

        if (response.status === 200) {
          const userInfo = await response.json();
          console.log('Login successful frontend');
          console.log('User Info:', userInfo);
          setUserInfo(userInfo)

          // Stop the webcam
          const stream = videoRef.current.srcObject;
          const tracks = stream.getTracks();
          tracks.forEach(track => track.stop());

          setRedirect(true)
        } else {
          console.error('Login failed');
        }
      } catch (err) {
        console.error('Error during login:', err);
      } finally {
        setLoading(false); // Set loading to false when registration is completed
      }
    } else {
      console.log('No face detected. Try again.');
      setLoading(false); // Set loading to false if no face is detected
    }
  };

  if(redirect) {
    return <Navigate to={'/home'} />
}

return (
  <div className="login-container">
    <h2 className='login'>Login</h2>
    <input
      type="email"
      placeholder="Email"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      className="login-input"
    />
    <video ref={videoRef} autoPlay className="video-element"></video>
    <canvas ref={canvasRef} className="canvas-element"></canvas>
    <button onClick={startVideo} className="start-button">Start Camera</button>
    <button onClick={loginUser} className="login-button">Login</button>
    {loading && <div className="loading">Loading...</div>}
  </div>
);
};

export default Login;