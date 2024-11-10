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
  Drawer,
  Divider,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import FavoriteIcon from '@mui/icons-material/Favorite';
import CalculateIcon from '@mui/icons-material/Calculate';
import buyerController from '../controllers/BuyerController';


  
function BuyerDashboard() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [carListings, setCarListings] = useState([]);
  const [shortlist, setShortlist] = useState([]);
  const [filteredShortlist, setFilteredShortlist] = useState([]);
  const [username, setUsername] = useState('Guest');
  const [selectedPage, setSelectedPage] = useState('listings');
  const LoanCalculator = () => {
    return <div>Loan Calculator Page</div>;
  };

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUsername(parsedUser.username || 'Guest');
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }

    const fetchData = async () => {
      try {
        const listingsData = await buyerController.getListings();
        setCarListings(listingsData);

        const shortlistData = await buyerController.getShortlist();
        setShortlist(shortlistData);
        setFilteredShortlist(shortlistData);
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
      setFilteredShortlist(updatedShortlist);
    } catch (error) {
      console.error('Error adding to shortlist:', error);
    }
  };

  const handleSearchShortlist = async () => {
    try {
      const results = searchQuery
        ? await buyerController.searchShortlist(searchQuery)
        : shortlist;
      setFilteredShortlist(results);
    } catch (error) {
      console.error('Error searching shortlist:', error);
    }
  };

  // Render Car Listings, Shortlist, or Loan Calculator based on selected page
  const renderContent = () => {
    if (selectedPage === 'listings') {
      return (
        <Box>
          <Typography variant="h5" sx={{ mt: 4 }}>
            Car Listings
          </Typography>
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
        </Box>
      );
    } else if (selectedPage === 'shortlist') {
      return (
        <Box>
          <Typography variant="h5" sx={{ mt: 4 }}>
            Shortlist
          </Typography>
          <TextField
            label="Search Shortlist"
            variant="outlined"
            fullWidth
            sx={{ mt: 2 }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Button variant="contained" sx={{ mt: 2 }} onClick={handleSearchShortlist}>
            Search
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
              : (
                  <Typography variant="body2" sx={{ mt: 2 }}>
                    No cars in your shortlist.
                  </Typography>
                )}
          </List>
        </Box>
      );
    } else if (selectedPage === 'loanCalculator') {
      return <LoanCalculator />;
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
      <Box sx={{ display: 'flex' }}>
        {/* Left Drawer Navigation */}
        <Drawer
          anchor="left"
          variant="permanent"
          sx={{
            width: 240,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: 240,
              boxSizing: 'border-box',
            },
          }}
        >
          <Toolbar />
          <Divider />
          <List>
            <ListItem button onClick={() => setSelectedPage('listings')}>
              <DirectionsCarIcon />
              <ListItemText primary="Car Listings" sx={{ ml: 2 }} />
            </ListItem>
            <ListItem button onClick={() => setSelectedPage('shortlist')}>
              <FavoriteIcon />
              <ListItemText primary="Shortlist" sx={{ ml: 2 }} />
            </ListItem>
            <ListItem button onClick={() => setSelectedPage('loanCalculator')}>
              <CalculateIcon />
              <ListItemText primary="Loan Calculator" sx={{ ml: 2 }} />
            </ListItem>
          </List>
        </Drawer>

        {/* Main Content Area */}
        <Container>
          <Box sx={{ mt: 4, ml: 3 }}>{renderContent()}</Box>
        </Container>
      </Box>
    </div>
  );
}

export default BuyerDashboard;

