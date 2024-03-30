import React, { useRef, useState, useEffect } from 'react';
import * as faceapi from 'face-api.js';


const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
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
        ])

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
    const detections = await faceapi.detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor();

      if (detections) {
        const faceDescriptor = Array.from(detections.descriptor);
        // console.log(faceDescriptor)
        try {
          const response = await fetch('http://localhost:3001/register', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, email, faceDescriptor }),
          });
  
          if (response.ok) {
            console.log('User registered successfully frontend');
            // Handle successful registration, e.g., redirect to login page
          } else {
            console.error('Error registering user');
            // Handle registration error
          }
        } catch (err) {
          console.error('Error registering user:', err);
          // Handle registration error
        }
      } else {
        console.log('No face detected');
        // Handle no face detected error
      }
    }

  return (
    <div>
      <h2>Registration</h2>
      <input type="text" placeholder="Name" value={username} onChange={e => setUsername(e.target.value)} />
      <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
      <video ref={videoRef} autoPlay></video>
      <canvas ref={canvasRef} />
      <button onClick={startVideo}>Start Camera</button>
      <button onClick={registerUser}>Register</button>
    </div>
  );
}

export default Register;