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
  const [loading, setLoading] = useState(false); // Optional: To handle loading state

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
      const response = await axios.post('http://localhost:5000/api/user_admin/login', credentials);
      console.log('Login Response:', response.data);

      // Check if response.data is truthy (i.e., profile data)
      if (response.data && typeof response.data === 'object') {
        const profile = response.data;

        // Save profile data to localStorage
        localStorage.setItem('user', JSON.stringify(profile));
        console.log('User profile saved to localStorage');

        // Redirect based on role
        switch (profile.role) {
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
        // response.data is false
        setError('Login failed: Invalid credentials or profile not found.');
        console.log('Login failed: Invalid credentials or profile not found.');
      }
    } catch (err) {
      console.error('Login Error:', err);
      if (err.response) {
        if (err.response.status === 401) {
          setError('Invalid credentials or account suspended.');
        } else if (err.response.status === 500) {
          setError('Internal server error. Please try again later.');
        } else {
          setError(err.response.data || 'Login failed.');
        }
      } else {
        setError('Network error. Please check your connection.');
      }
    } finally {
      setLoading(false); // End loading
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
            disabled={loading} // Optional: Disable button while loading
          >
            {loading ? 'Logging in...' : 'Login'}
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default Login;
