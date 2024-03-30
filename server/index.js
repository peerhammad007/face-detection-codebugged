import express from "express";
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from "cookie-parser";
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken'
import User from "./model/User.js";
import * as faceapi from 'face-api.js';


const app = express();

app.use(express.json());
app.use(cors({
  credentials: true,
  origin: 'http://localhost:3000'
}));
app.use(cookieParser());

dotenv.config();

const PORT = process.env.PORT;
const MONGO_URL = process.env.MONGO_URL;
const SECRET = process.env.SECRET;

//REGISTER
app.post('/register', async (req, res) => {
    try {
        const {username, email, faceDescriptor} = req.body;
        // console.log(faceDescriptor)
        const newUser = new User({
          username,
          email,
          faceDescriptor,
        });
    
        await newUser.save();
        res.status(200).json({ message: 'User registered successfully' });
      } catch (err) {
        console.error('Error registering user:', err);
      }
});

//Login
app.post('/login', async (req, res) => {
    try {
      const { email, faceDescriptor } = req.body;
  
      // Find the user by email
      const user = await User.findOne({ email });
  
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      // Compare the face descriptor with the stored descriptor
      const storedDescriptor = user.faceDescriptor;
      const isMatch = compareFaceDescriptors(faceDescriptor, storedDescriptor);
  
      if (isMatch) {
        // Successful login

        const token = jwt.sign({ userId: user._id, username: user.username }, SECRET, {});
      return res
      .cookie('token', token, {
        httpOnly: true, // Prevent client-side script from accessing the cookie
        secure: process.env.NODE_ENV === 'production', // Only send cookie over HTTPS in production
        maxAge: 24 * 60 * 60 * 1000, // 1 day in milliseconds
        sameSite: 'strict', // Protect against CSRF attacks
      })
        .json({ id: user._id, username: user.username });
      } else {
        // Failed login
        return res.status(401).json({ error: 'Invalid credentials' });
      }
    } catch (err) {
      console.error('Error during login:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

// PROFILE
app.get('/profile', (req, res) => {
  // Get the token from the request cookies
  console.log(req.cookies)
  const token = req.cookies.token;
  console.log(token)

  // Verify the token
  jwt.verify(token, SECRET, (err, decoded) => {
    if (err) {
      // If token verification fails, return unauthorized status
      return res.status(401).json({ error: 'Unauthorized' });
    } else {
      // If token is valid, extract user ID and username
      const { userId, username } = decoded;

      // Return user ID and username as JSON response
      res.json({ id: userId, username: username });
    }
  });
});


//LOGOUT
app.post('/logout', (req, res) => {
  res.cookie('token', '').json('ok');
})

  function compareFaceDescriptors(descriptor1, descriptor2) {
    const distance = faceapi.euclideanDistance(descriptor1, descriptor2);
    const threshold = 0.6; // Adjust this value based on your requirements
  
    // If the distance is less than the threshold, the descriptors are considered a match
    return distance < threshold;
  }
  

mongoose.connect(MONGO_URL)
    .then(() => {
        console.log('MongoDB connected successfully');
        app.listen(PORT, () => {
            console.log(`Listening on port ${PORT}`);
        });
    });
