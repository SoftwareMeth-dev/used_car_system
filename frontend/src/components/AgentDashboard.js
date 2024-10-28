// src/components/SellerDashboard.js
import React from 'react';
import { AppBar, Toolbar, Typography, Button, Container, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';

function AgentDashboard() {
  const navigate = useNavigate();
  const userData = localStorage.getItem('user');

  let user = {};
  if (userData) {
    try {
      user = JSON.parse(userData).profile;
    } catch (error) {
      console.error('Error parsing user data:', error);
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('user');
    console.log('User logged out');
    navigate('/');
  };

  return (
    <div>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Agent Dashboard
          </Typography>
          <Typography variant="body1" sx={{ mr: 2 }}>
            {user.username}
          </Typography>
          <Button color="inherit" onClick={handleLogout}>Logout</Button>
        </Toolbar>
      </AppBar>
      <Container>
        <Box sx={{ mt: 4 }}>
          <Typography variant="h4">Welcome, {user.username}!</Typography>
          <Typography variant="body1" sx={{ mt: 2 }}>
            This is the Agent Dashboard. More features coming soon.
          </Typography>
        </Box>
      </Container>
    </div>
  );
}

export default AgentDashboard;
