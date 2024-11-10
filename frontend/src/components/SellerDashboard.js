// src/components/SellerDashboard.js
import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Box,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import SellerMetricsController from "../controllers/SellerMetricsController";

function SellerDashboard() {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState({ views: 0, shortlists: 0 });

  useEffect(() => {
    // Use the controller to fetch metrics
    SellerMetricsController.getMetrics()
      .then(setMetrics)
      .catch((error) => console.error("Error fetching metrics:", error));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Seller Dashboard
          </Typography>
          <Button color="inherit" onClick={handleLogout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>
      <Container>
        <Box sx={{ mt: 4 }}>
          <Typography variant="h4">Welcome to Your Dashboard!</Typography>
          <Typography variant="body1" sx={{ mt: 2 }}>
            This is a prototype for the View Seller Metrics use case.
          </Typography>
          <Typography variant="body1" sx={{ mt: 2 }}>
            Views: {metrics.views} | Shortlists: {metrics.shortlists}
          </Typography>
        </Box>
      </Container>
    </div>
  );
}

export default SellerDashboard;
