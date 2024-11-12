// src/components/SellerDashboard.js
import React, { useState, useEffect } from "react";
import {
  Container,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  CircularProgress,
  TextField,
  Typography,
  AppBar,
  Toolbar,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TablePagination,
  Snackbar,
  Alert,
  Card,
  CardActionArea,
  CardContent,
  Grid,
} from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import config from "../config";
import HomeIcon from "@mui/icons-material/Home";
import PeopleIcon from "@mui/icons-material/People";
import PersonIcon from "@mui/icons-material/Person";
// Define the width of the sidebar drawer
const drawerWidth = 240;

// Regular expression for basic email validation
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
function AgentDashboard() {
  const navigate = useNavigate();
  const userData = localStorage.getItem("user");

  let user = {};
  if (userData) {
    try {
      user = JSON.parse(userData).profile;
    } catch (error) {
      console.error("Error parsing user data:", error);
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("user");
    console.log("User logged out");
    navigate("/");
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
          <Button color="inherit" onClick={handleLogout}>
            Logout
          </Button>
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
