// src/components/Login.js
import React, { useState } from 'react';
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
} from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import config from '../config';  
import backgroundVideo from '../Comp_8.mp4';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();

  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);  

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true); // Start loading
    console.log('Attempting to log in with:', credentials);
    try {
      const response = await axios.post(`${config.API_BASE_URL}/login`, credentials);
      console.log('Login Response:', response.data);

      // Check if response.data contains 'user' and 'profile'
      if (response.status === 200 && response.data.user && response.data.profile) {
        const { user, profile } = response.data;
        console.log(response.data)
        
        // Extract userID from user object (assuming it's '_id')
        const userID = user._id || user.id; 

        // Save user, profile, and userID to localStorage
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('profile', JSON.stringify(profile));
        localStorage.setItem('userID', userID); // Explicitly store userID
        console.log(userID)
        console.log('User, profile, and userID saved to localStorage');

        // Redirect based on role
        switch (profile.role) {
          case 'user_admin':
            console.log('Redirecting to admin dashboard');
            navigate('/admin');
            break;
          case 'used_car_agent':
            console.log('Redirecting to agent dashboard');
            navigate('/used_car_agent'); 
            break;
          case 'seller':
            console.log('Redirecting to seller dashboard');
            navigate('/seller');
            break;
          case 'buyer':
            console.log('Redirecting to buyer dashboard');
            navigate('/buyer');
            break;
          default:
            console.log('Redirecting to home');
            navigate('/');
        }
      } else {
        // response.data does not contain expected fields
        setError('Login failed: Invalid credentials or profile not found.');
        console.log('Login failed: Invalid credentials or profile not found.');
      }
    } catch (err) {
      console.error('Login Error:', err);
      if (err.response) {
        if (err.response.status === 400) {
          setError('Bad Request: Missing username or password.');
        } else if (err.response.status === 401) {
          setError('Unauthorized: Invalid credentials.');
        } else if (err.response.status === 404) {
          setError('Not Found: User does not exist.');
        } else if (err.response.status === 500) {
          setError('Internal Server Error: Please try again later.');
        } else {
          setError('Login failed: ' + (err.response.data.error || 'Unknown error.'));
        }
      } else {
        setError('Network error: Please check your connection.');
      }
    } finally {
      setLoading(false); // End loading
    }
  };

  return (
    <div className="login-page">
      {/* Video Background */}
      <video autoPlay loop muted className="background-video">
        <source src={backgroundVideo} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <Container maxWidth="sm" className="login-container">
        <Box
          sx={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            boxShadow: 3,
            borderRadius: 2,
            backgroundColor: 'rgba(255, 255, 255, 0.8)', // Semi-transparent background
          }}
        >
          <Typography component="h1" variant="h4">
            Login
          </Typography>
          {error && <Alert severity="error" sx={{ width: '100%', mt: 2 }}>{error}</Alert>}
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <TextField
              required
              fullWidth
              label="Username"
              name="username"
              value={credentials.username}
              onChange={handleChange}
              margin="normal"
            />
            <TextField
              required
              fullWidth
              label="Password"
              type="password"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              margin="normal"
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              sx={{ mt: 3 }}
              disabled={loading} // Disable button while loading
            >
              {loading ? <CircularProgress size={24} /> : 'Login'}
            </Button>
          </Box>
        </Box>
      </Container>
    </div>
  );
};


export default Login;
