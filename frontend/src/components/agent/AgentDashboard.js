// src/components/AgentDashboard.js
import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Box,
  Button,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import HomeIcon from "@mui/icons-material/Home";
import AgentListingsController from "./AgentListingsController";

const AgentDashboard = () => {
  const navigate = useNavigate();
  const [listings, setListings] = useState([]); // State for listings
  const userData = localStorage.getItem("user");

  let user = {};
  if (userData) {
    try {
      user = JSON.parse(userData).profile;
    } catch (error) {
      console.error("Error parsing user data:", error);
    }
  }

  useEffect(() => {
    // Fetch listings when the component mounts
    const fetchListings = async () => {
      try {
        const data = await AgentListingsController.fetchAllListings();
        setListings(data); // Set the listings data
      } catch (error) {
        console.error("Error fetching listings:", error);
      }
    };
    fetchListings();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div>
      <AppBar position="static">
        <Toolbar>
          <HomeIcon sx={{ mr: 2 }} />
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
            Here are your listings:
          </Typography>

          <Table sx={{ mt: 4 }}>
            <TableHead>
              <TableRow>
                <TableCell>Listing ID</TableCell>
                <TableCell>Title</TableCell>
                <TableCell>Price</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {listings.map((listing) => (
                <TableRow key={listing.id}>
                  <TableCell>{listing.id}</TableCell>
                  <TableCell>{listing.title}</TableCell>
                  <TableCell>{listing.price}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      </Container>
    </div>
  );
};

export default AgentDashboard;
