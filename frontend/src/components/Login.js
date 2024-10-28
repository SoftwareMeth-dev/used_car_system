// src/components/Login.js
import React, { useState } from 'react';
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
} from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();

  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
  });

  const [error, setError] = useState('');

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value,
    });
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  console.log('Attempting to log in with:', credentials);
  try {
    const response = await axios.post('http://localhost:5000/api/user_admin/login', credentials);
    console.log('Login Response:', response.data);
    if (response.data.profile) {
      // Save user data to localStorage
      localStorage.setItem('user', JSON.stringify(response.data));
      console.log('User data saved to localStorage');
      console.log(response.data.profile.role)
      // Redirect based on role
      switch (response.data.profile.role) {
        case 'user_admin':
          console.log('Redirecting to admin dashboard');
          navigate('/admin');
          break;
        case 'used_car_agent':
          console.log('Redirecting to agent dashboard');
          navigate('/used_car_agent'); // Ensure this matches ProtectedRoute
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
      setError('Login failed: No profile information received.');
      console.log('Login failed: No profile information received.');
    }
  } catch (err) {
    console.error('Login Error:', err);
    setError(err.response?.data?.message || 'Login failed');
  }
};

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          padding: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          boxShadow: 3,
          borderRadius: 2,
        }}
      >
        <Typography component="h1" variant="h5">
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
          >
            Login
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default Login;
