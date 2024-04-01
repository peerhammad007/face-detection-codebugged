import React, { useRef, useState, useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
import * as faceapi from 'face-api.js';
import BASE_URL from '../config';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false); // State variable for loading
  const [modelsLoaded, setModelsLoaded] = useState(false); // State variable to track model loading
  const videoRef = useRef();
  const canvasRef = useRef();
  const navigate = useNavigate();

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
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        videoRef.current.srcObject = stream;
      })
      .catch(err => console.error(err));
  }

  const registerUser = async () => {
    if (!modelsLoaded) {
      console.warn('Models are not loaded yet. Please wait.');
      return;
    }
    setLoading(true); // Set loading to true when registration starts
    const detections = await faceapi.detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor();

      if (detections) {
        const faceDescriptor = Array.from(detections.descriptor);
        // console.log(faceDescriptor)
        try {
          const response = await fetch(`${BASE_URL}/register`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, email, faceDescriptor }),
          });
  
          if (response.ok) {
            console.log('User registered successfully');
            // Stop the webcam
            const stream = videoRef.current.srcObject;
            const tracks = stream.getTracks();
            tracks.forEach(track => track.stop());
            //redirect to login page
            navigate('/');

          } else {
            console.error('Error registering user');
          }
        } catch (err) {
          console.error('Error registering user:', err);
        } finally {
          setLoading(false); // Set loading to false when registration is completed
        }
      } else {
        console.log('No face detected. Try again.');
        setLoading(false); // Set loading to false if no face is detected

      }
    }

    return (
      <div className="register-container">
        <h2>Registration</h2>
        <input
          type="text"
          placeholder="Name"
          value={username}
          onChange={e => setUsername(e.target.value)}
          className="register-input"
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="register-input"
        />
        <video ref={videoRef} autoPlay className="video-element"></video>
        <canvas ref={canvasRef} className="canvas-element"></canvas>
        <button onClick={startVideo} className="start-button">Start Camera</button>
        <button onClick={registerUser} className="register-button">Register</button>
        {loading && <div className="loading">Loading...</div>}
      </div>
    );
}

export default Register;