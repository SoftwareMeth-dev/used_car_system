// src/components/BuyerDashboard.js
import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Box,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import buyerController from '../controllers/BuyerController'; // Ensure correct import

function BuyerDashboard() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [carListings, setCarListings] = useState([]);
  const [shortlist, setShortlist] = useState([]);
  const [filteredShortlist, setFilteredShortlist] = useState([]);
  const [username, setUsername] = useState('Guest');

  useEffect(() => {
    // Load user data
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUsername(parsedUser.username || 'Guest');
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }

    // Load car listings and shortlist
    const fetchData = async () => {
      try {
        const listingsData = await buyerController.getListings();
        setCarListings(listingsData);

        const shortlistData = await buyerController.getShortlist();
        setShortlist(shortlistData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const handleLogout = () => {
    buyerController.logout();
    navigate('/');
  };

  const handleSearch = async () => {
    try {
      const results = await buyerController.searchListings(searchQuery);
      setCarListings(results);
    } catch (error) {
      console.error('Error searching listings:', error);
    }
  };

  const handleAddToShortlist = async (listingId) => {
    try {
      await buyerController.saveToShortlist(listingId);
      const updatedShortlist = await buyerController.getShortlist();
      setShortlist(updatedShortlist);
    } catch (error) {
      console.error('Error adding to shortlist:', error);
    }
  };

  const handleSearchShortlist = async () => {
    try {
      const results = await buyerController.searchShortlist(searchQuery);
      setFilteredShortlist(results);
    } catch (error) {
      console.error('Error searching shortlist:', error);
    }
  };

  return (
    <div>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Buyer Dashboard
          </Typography>
          <Typography variant="body1" sx={{ mr: 2 }}>
            {username}
          </Typography>
          <Button color="inherit" onClick={handleLogout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>
      <Container>
        <Box sx={{ mt: 4 }}>
          <Typography variant="h4">Welcome, {username}!</Typography>
          <TextField
            label="Search Listings"
            variant="outlined"
            fullWidth
            sx={{ mt: 2 }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Button variant="contained" sx={{ mt: 2 }} onClick={handleSearch}>
            Search
          </Button>

          <Typography variant="h5" sx={{ mt: 4 }}>
            Car Listings
          </Typography>
          <List>
            {carListings.map((listing) => (
              <ListItem key={listing.id}>
                <ListItemText
                  primary={`${listing.make} ${listing.model} - $${listing.price}`}
                />
                <ListItemSecondaryAction>
                  <Button
                    variant="outlined"
                    onClick={() => handleAddToShortlist(listing.id)}
                  >
                    Shortlist
                  </Button>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>

          <Typography variant="h5" sx={{ mt: 4 }}>
            Shortlist
          </Typography>
          <Button
            variant="contained"
            sx={{ mt: 2 }}
            onClick={handleSearchShortlist}
          >
            Search Shortlist
          </Button>
          <List>
            {filteredShortlist.length > 0
              ? filteredShortlist.map((listing) => (
                  <ListItem key={listing.id}>
                    <ListItemText
                      primary={`${listing.make} ${listing.model} - $${listing.price}`}
                    />
                  </ListItem>
                ))
              : shortlist.map((listing) => (
                  <ListItem key={listing.id}>
                    <ListItemText
                      primary={`${listing.make} ${listing.model} - $${listing.price}`}
                    />
                  </ListItem>
                ))}
          </List>
        </Box>
      </Container>
    </div>
  );
}

export default BuyerDashboard;
