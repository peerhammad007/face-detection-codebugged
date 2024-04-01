import React, { useRef, useState, useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
import * as faceapi from 'face-api.js';


const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const videoRef = useRef();
  const canvasRef = useRef();
  const navigate = useNavigate();

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
        }
      } else {
        console.log('No face detected');
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
      </div>
    );
}

export default Register;