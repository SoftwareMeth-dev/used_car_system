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
  Paper
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import FavoriteIcon from '@mui/icons-material/Favorite';
import CalculateIcon from '@mui/icons-material/Calculate';
import buyerController from '../controllers/BuyerController';

function LoanCalculator() {
  const [loanAmount, setLoanAmount] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [loanTerm, setLoanTerm] = useState('');
  const [monthlyPayment, setMonthlyPayment] = useState(null);

  const handleCalculate = () => {
    const payment = calculateMonthlyPayment(loanAmount, interestRate, loanTerm);
    setMonthlyPayment(payment);
  };

  const calculateMonthlyPayment = (loanAmount, annualInterestRate, loanTermYears) => {
    const principal = parseFloat(loanAmount);
    const monthlyInterestRate = parseFloat(annualInterestRate) / 100 / 12;
    const numberOfPayments = parseInt(loanTermYears) * 12;

    if (isNaN(principal) || isNaN(monthlyInterestRate) || isNaN(numberOfPayments) || principal <= 0 || monthlyInterestRate < 0 || numberOfPayments <= 0) {
      return 0;
    }

    return (principal * monthlyInterestRate) / (1 - Math.pow(1 + monthlyInterestRate, -numberOfPayments));
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Loan Calculator</Typography>
      <Paper sx={{ padding: 3, mb: 3 }}>
        <TextField
          label="Loan Amount"
          value={loanAmount}
          onChange={(e) => setLoanAmount(e.target.value)}
          variant="outlined"
          fullWidth
          sx={{ mb: 2 }}
          type="number"
        />
        <TextField
          label="Annual Interest Rate (%)"
          value={interestRate}
          onChange={(e) => setInterestRate(e.target.value)}
          variant="outlined"
          fullWidth
          sx={{ mb: 2 }}
          type="number"
        />
        <TextField
          label="Loan Term (Years)"
          value={loanTerm}
          onChange={(e) => setLoanTerm(e.target.value)}
          variant="outlined"
          fullWidth
          sx={{ mb: 2 }}
          type="number"
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleCalculate}
          fullWidth
        >
          Calculate
        </Button>
      </Paper>

      {monthlyPayment !== null && (
        <Paper sx={{ padding: 3 }}>
          <Typography variant="h6">Estimated Monthly Payment</Typography>
          <Divider sx={{ my: 2 }} />
          <Typography variant="body1">${monthlyPayment.toFixed(2)}</Typography>
        </Paper>
      )}
    </Box>
  );
}

function BuyerDashboard() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [search1Query, setSearch1Query] = useState('');
  const [carListings, setCarListings] = useState([]);
  const [shortlist, setShortlist] = useState([]);
  const [filteredShortlist, setFilteredShortlist] = useState([]);
  const [username, setUsername] = useState('Guest');
  const [selectedPage, setSelectedPage] = useState('listings');
  const [reviews, setReviews] = useState({});

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
          // set the array
          listingsData.forEach(async (listing) => {
            const reviewData = await buyerController.fetchReviews(listing.agent_id);
            if (reviewData && reviewData.data && reviewData.data.reviews.length > 0) {
              setReviews((prev) => ({
                ...prev,
                [listing.agent_id]: {
                  average_rating: reviewData.data.average_rating,
                  reviews: reviewData.data.reviews
                }
              }));
            }
          });

        const shortlistData = await buyerController.getShortlist(username);
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

  const handleShortlistSearch = async () => {
    try {
      const results = await buyerController.searchShortlist(username, search1Query);
      setShortlist(results);
      setFilteredShortlist(results);
    } catch (error) {
      console.error('Error searching shortlist:', error);
    }
  };

  const handleAddToShortlist = async (listingId) => {
    try {
      const data = {
        user_id: username,
        listing_id: listingId
      };
      await buyerController.saveToShortlist(data);
      const updatedShortlist = await buyerController.getShortlist(username);
      setShortlist(updatedShortlist);
      setFilteredShortlist(updatedShortlist);
    } catch (error) {
      console.error('Error adding to shortlist:', error);
    }
  };

  const renderContent = () => {
    if (selectedPage === 'listings') {
      return (
        <Box>
          <Typography variant="h5" sx={{ mt: 4 }}>Car Listings</Typography>
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
              <ListItem key={listing.id} sx={{ flexDirection: 'column', alignItems: 'flex-start' }}>
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
  
                <Box sx={{ mt: 2, width: '100%' }}>
                  <Typography variant="subtitle1">Agent Reviews:</Typography>
                  {reviews[listing.agent_id] ? (
                    <>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        Average Rating: {reviews[listing.agent_id].average_rating}/5
                      </Typography>
                      {reviews[listing.agent_id].reviews.map((review, index) => (
                        <Paper key={review._id} sx={{ p: 2, mt: 1 }}>
                          <Typography variant="body2"><strong>Rating:</strong> {review.rating}/5</Typography>
                          <Typography variant="body2"><strong>Comment:</strong> {review.review}</Typography>
                          <Typography variant="body2"><strong>Reviewer Role:</strong> {review.reviewer_role}</Typography>
                          <Typography variant="body2" color="textSecondary">
                            <strong>Date:</strong> {new Date(review.created_at).toLocaleDateString()}
                          </Typography>
                        </Paper>
                      ))}
                    </>
                  ) : (
                    <Typography variant="body2">No reviews available.</Typography>
                  )}
                </Box>
              </ListItem>
            ))}
          </List>
        </Box>
      );
    } else if (selectedPage === 'shortlist') {
      return (
        <Box>
          <Typography variant="h5" sx={{ mt: 4 }}>Shortlist</Typography>
          <TextField
            label="Search Shortlist"
            variant="outlined"
            fullWidth
            sx={{ mt: 2 }}
            value={search1Query}
            onChange={(e) => setSearch1Query(e.target.value)}
          />
          <Button variant="contained" sx={{ mt: 2 }} onClick={handleShortlistSearch}>
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

        <Container>
          <Box sx={{ mt: 4, ml: 3 }}>{renderContent()}</Box>
        </Container>
      </Box>
    </div>
  );
}

export default BuyerDashboard;
