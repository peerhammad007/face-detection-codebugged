import React, { useRef, useState, useEffect, useContext } from 'react';
import { UserContext } from '../context/UserContext';
import { Navigate } from 'react-router-dom';
import * as faceapi from 'face-api.js';

const Login = () => {
  const [email, setEmail] = useState('');
  const [redirect, setRedirect] = useState(false);
  const { setUserInfo } = useContext(UserContext);
  
  const videoRef = useRef();
  const canvasRef = useRef();

  useEffect(() => {
    const loadModels = async () => {
      try {
        Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
          faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
          faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
          faceapi.nets.faceExpressionNet.loadFromUri('/models'),
        ]);
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
    const detections = await faceapi
      .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (detections) {
      const faceDescriptor = Array.from(detections.descriptor);
      // console.log(faceDescriptor)
      try {
        const response = await fetch('http://localhost:3001/login', {
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

          setRedirect(true)
          // Handle successful login, e.g., redirect to dashboard
        } else {
          console.error('Login failed');
          // Handle login error
        }
      } catch (err) {
        console.error('Error during login:', err);
        // Handle login error
      }
    } else {
      console.log('No face detected');
      // Handle no face detected error
    }
  };

  if(redirect) {
    return <Navigate to={'/home'} />
}

  return (
    <div>
      <h2>Login</h2>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <video ref={videoRef} autoPlay></video>
      <canvas ref={canvasRef} />
      <button onClick={startVideo}>Start Camera</button>
      <button onClick={loginUser}>Login</button>
    </div>
  );
};

export default Login;