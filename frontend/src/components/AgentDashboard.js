// src/components/AgentDashboard.js

import React, { useState, useEffect } from 'react';
import {
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
  Rating,
} from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import config from '../config';
import HomeIcon from '@mui/icons-material/Home';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import RateReviewIcon from '@mui/icons-material/RateReview';

// Define the width of the sidebar drawer
const drawerWidth = 240;

// Helper function to format snake_case to Proper Case
const formatLabel = (str) => {
  return str
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Define available models, years, and price ranges for filtering
const availableModels = ['Sedan', 'SUV', 'Coupe', 'Hatchback', 'Convertible', 'Truck', 'Van'];
const availableYears = Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i);
const priceRanges = [
  { label: '$0 - $10,000', min: 0, max: 10000 },
  { label: '$10,001 - $20,000', min: 10001, max: 20000 },
  { label: '$20,001 - $30,000', min: 20001, max: 30000 },
  { label: '$30,001 - $40,000', min: 30001, max: 40000 },
  { label: '$40,001+', min: 40001, max: Infinity },
];

const AgentDashboard = () => {
  const navigate = useNavigate();

  // State for Sidebar Navigation
  const [currentView, setCurrentView] = useState('landing'); // 'landing', 'listings', 'reviews'

  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success', // 'success', 'error', 'warning', 'info'
  });

  const [loading, setLoading] = useState(false);

  // States for Used Car Listings
  const [listings, setListings] = useState([]);
  const [filteredListings, setFilteredListings] = useState([]); // To store filtered listings
  const [listingSearchQuery, setListingSearchQuery] = useState('');
  const [listingModelFilter, setListingModelFilter] = useState('');
  const [listingYearFilter, setListingYearFilter] = useState('');
  const [listingPriceRangeFilter, setListingPriceRangeFilter] = useState('');
  const [listingPage, setListingPage] = useState(0);
  const [listingRowsPerPage, setListingRowsPerPage] = useState(5);

  // States for Reviews
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(null);

  // States for Dialogs
  const [openCreateListing, setOpenCreateListing] = useState(false);
  const [newListing, setNewListing] = useState({
    make: '',
    model: '',
    year: '',
    price: '',
  });
  const [listingErrors, setListingErrors] = useState({});

  const [openUpdateListing, setOpenUpdateListing] = useState(false);
  const [selectedListing, setSelectedListing] = useState(null);
  const [updatedListingData, setUpdatedListingData] = useState({
    make: '',
    model: '',
    year: '',
    price: '',
  });
  const [updateListingErrors, setUpdateListingErrors] = useState({});

  const [openDeleteListing, setOpenDeleteListing] = useState(false);
  const [listingToDelete, setListingToDelete] = useState(null);

  // Retrieve Agent Information from localStorage
  const getAgentInfo = () => {
    const user = localStorage.getItem('user');
    const userID = localStorage.getItem('userID');
    if (user && userID) {
      try {
        const parsedUser = JSON.parse(user);
        return { ...parsedUser, userID };
      } catch (e) {
        return null;
      }
    }
    return null;
  };

  const agentInfo = getAgentInfo();
  const userID = agentInfo ? agentInfo.userID : null; // Using userID for identification

  // Redirect to login if userID is not found
  useEffect(() => {
    if (!userID) {
      setSnackbar({
        open: true,
        message: 'Agent information not found. Please log in again.',
        severity: 'error',
      });
      navigate('/login');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userID]);

  // Handle Sidebar Navigation
  const handleNavigation = (view) => {
    setCurrentView(view);
    // Reset Snackbar messages on view change
    setSnackbar({ ...snackbar, open: false });
  };

  // Fetch Listings (with optional search query)
  const fetchListings = async () => {
    if (!userID) {
      setSnackbar({
        open: true,
        message: 'Agent information not found. Please log in again.',
        severity: 'error',
      });
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      const endpoint = `${config.API_BASE_URL}/used_car_agent/view_listings`;
      const params = { agent_id: userID }; // Pass userID as agent identifier

      const response = await axios.get(endpoint, { params });

      if (response.status === 200) {
        // Frontend filter to ensure only agent's listings are displayed
        const agentListings = response.data.listings.filter(
          (listing) => listing.seller_id === userID
        );
        setListings(agentListings);
        setFilteredListings(agentListings);
      }
    } catch (error) {
      console.error('Error fetching listings:', error);
      setSnackbar({
        open: true,
        message: 'Failed to fetch listings.',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch Reviews and Average Rating
  const fetchReviews = async () => {
    if (!userID) { // Use userID for identification
      setSnackbar({
        open: true,
        message: 'Agent information not found. Please log in again.',
        severity: 'error',
      });
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(`${config.API_BASE_URL}/used_car_agent/view_reviews/${userID}`);

      if (response.status === 200) {
        setReviews(response.data.reviews);
        setAverageRating(response.data.average_rating);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setSnackbar({
        open: true,
        message: 'Failed to fetch reviews.',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  // Initial Fetch
  useEffect(() => {
    if (currentView === 'listings') {
      fetchListings();
    } else if (currentView === 'reviews') {
      fetchReviews();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentView]);

  // ----------------------- Used Car Listings Functions -----------------------

  /**
   * User Story: As a used car agent, I want to create used car listings so that I can advertise cars for sale.
   * Trigger: The agent submits the create listing form.
   */
  // Validate Create Listing Form
  const validateCreateListing = () => {
    const errors = {};
    if (!newListing.make.trim()) errors.make = 'Make is required.';
    if (!newListing.model.trim()) errors.model = 'Model is required.';
    if (!newListing.year) {
      errors.year = 'Year is required.';
    } else if (!/^\d{4}$/.test(newListing.year)) {
      errors.year = 'Year must be a 4-digit number.';
    }
    if (!newListing.price) {
      errors.price = 'Price is required.';
    } else if (isNaN(newListing.price) || Number(newListing.price) <= 0) {
      errors.price = 'Price must be a positive number.';
    }
    setListingErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateListing = async () => {
    if (!validateCreateListing()) return;
    setLoading(true);
    try {
      const payload = {
        seller_id: userID, // Use userID as agent identifier
        make: newListing.make,
        model: newListing.model,
        year: Number(newListing.year),
        price: Number(newListing.price),
      };
      const response = await axios.post(`${config.API_BASE_URL}/used_car_agent/create_listing`, payload);
      if (response.status === 201) {
        setSnackbar({
          open: true,
          message: 'Listing created successfully.',
          severity: 'success',
        });
        fetchListings(); // Refresh listings
        setOpenCreateListing(false); // Close dialog
        setNewListing({ make: '', model: '', year: '', price: '' }); // Reset form
        setListingErrors({});
      }
    } catch (error) {
      console.error('Error creating listing:', error);
      if (error.response && error.response.data && error.response.data.error) {
        setSnackbar({
          open: true,
          message: JSON.stringify(error.response.data.error),
          severity: 'error',
        });
      } else {
        setSnackbar({
          open: true,
          message: 'Failed to create listing.',
          severity: 'error',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * User Story: As a used car agent, I want to update used car listings so that I can keep the information current.
   * Trigger: The agent submits the update listing form.
   */
  // Validate Update Listing Form
  const validateUpdateListing = () => {
    const errors = {};
    if (!updatedListingData.make.trim()) errors.make = 'Make is required.';
    if (!updatedListingData.model.trim()) errors.model = 'Model is required.';
    if (!updatedListingData.year) {
      errors.year = 'Year is required.';
    } else if (!/^\d{4}$/.test(updatedListingData.year)) {
      errors.year = 'Year must be a 4-digit number.';
    }
    if (!updatedListingData.price) {
      errors.price = 'Price is required.';
    } else if (isNaN(updatedListingData.price) || Number(updatedListingData.price) <= 0) {
      errors.price = 'Price must be a positive number.';
    }
    setUpdateListingErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleUpdateListing = async () => {
    if (!validateUpdateListing()) return;
    setLoading(true);
    try {
      const payload = {
        make: updatedListingData.make,
        model: updatedListingData.model,
        year: Number(updatedListingData.year),
        price: Number(updatedListingData.price),
      };
      // Use listing's _id as the identifier
      const response = await axios.put(
        `${config.API_BASE_URL}/used_car_agent/update_listing/${selectedListing._id}`,
        payload
      );
      if (response.status === 200) {
        setSnackbar({
          open: true,
          message: 'Listing updated successfully.',
          severity: 'success',
        });
        fetchListings(); // Refresh listings
        setOpenUpdateListing(false); // Close dialog
        setSelectedListing(null);
        setUpdatedListingData({ make: '', model: '', year: '', price: '' });
        setUpdateListingErrors({});
      }
    } catch (error) {
      console.error('Error updating listing:', error);
      if (error.response && error.response.data && error.response.data.error) {
        setSnackbar({
          open: true,
          message: JSON.stringify(error.response.data.error),
          severity: 'error',
        });
      } else {
        setSnackbar({
          open: true,
          message: 'Failed to update listing.',
          severity: 'error',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * User Story: As a used car agent, I want to delete used car listings so that sold or unavailable cars are removed.
   * Trigger: The agent confirms the deletion of a listing.
   */
  const handleDeleteListing = async () => {
    setLoading(true);
    try {
      // Use listing's _id as the identifier
      const response = await axios.delete(`${config.API_BASE_URL}/used_car_agent/delete_listing/${listingToDelete._id}`);
      if (response.status === 200) {
        setSnackbar({
          open: true,
          message: 'Listing deleted successfully.',
          severity: 'success',
        });
        fetchListings(); // Refresh listings
        setOpenDeleteListing(false); // Close dialog
        setListingToDelete(null);
      }
    } catch (error) {
      console.error('Error deleting listing:', error);
      if (error.response && error.response.data && error.response.data.error) {
        setSnackbar({
          open: true,
          message: JSON.stringify(error.response.data.error),
          severity: 'error',
        });
      } else {
        setSnackbar({
          open: true,
          message: 'Failed to delete listing.',
          severity: 'error',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * User Story: As a used car agent, I want to search for used car listings so that I can find specific cars.
   * Trigger: The agent enters a search query and submits.
   */
  const handleSearchListings = () => {
    let filtered = [...listings];

    // Filter by Name
    if (listingSearchQuery.trim() !== '') {
      const query = listingSearchQuery.trim().toLowerCase();
      filtered = filtered.filter(
        (listing) =>
          listing.make.toLowerCase().includes(query) ||
          listing.model.toLowerCase().includes(query)
      );
    }

    // Filter by Model
    if (listingModelFilter !== '') {
      filtered = filtered.filter((listing) => listing.model === listingModelFilter);
    }

    // Filter by Year
    if (listingYearFilter !== '') {
      filtered = filtered.filter((listing) => listing.year === Number(listingYearFilter));
    }

    // Filter by Price Range
    if (listingPriceRangeFilter !== '') {
      const selectedRange = priceRanges.find(range => range.label === listingPriceRangeFilter);
      if (selectedRange) {
        filtered = filtered.filter(
          (listing) => listing.price >= selectedRange.min && listing.price <= selectedRange.max
        );
      }
    }

    setFilteredListings(filtered);
    setListingPage(0); // Reset to first page after search
  };

  /**
   * User Story: As a used car agent, I want to reset the search to view all listings.
   * Trigger: The agent clicks the reset search button.
   */
  const handleResetSearch = () => {
    setListingSearchQuery('');
    setListingModelFilter('');
    setListingYearFilter('');
    setListingPriceRangeFilter('');
    setFilteredListings(listings);
    setListingPage(0); // Reset to first page after reset
  };

  // ----------------------- Reviews Functions -----------------------

  /**
   * User Story: As a used car agent, I want to view the ratings and reviews so that I can understand client feedback and improve my services.
   * Trigger: The agent navigates to the Reviews view.
   */
  const renderReviews = () => {
    return (
      <Box>
        <Typography variant="h5" gutterBottom>
          Client Reviews
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Rating value={averageRating} precision={0.1} readOnly />
          <Typography variant="h6" sx={{ ml: 2 }}>
            {averageRating ? averageRating.toFixed(1) : 'No ratings yet'}
          </Typography>
        </Box>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : reviews.length > 0 ? (
          <Grid container spacing={2}>
            {reviews.map((review) => (
              <Grid item xs={12} md={6} key={review._id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Rating value={review.rating} readOnly />
                      <Typography variant="subtitle1" sx={{ ml: 2 }}>
                        {formatLabel(review.reviewer_role)}
                      </Typography>
                    </Box>
                    <Typography variant="body1">{review.review || 'No comments provided.'}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(review.created_at).toLocaleString()}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Typography>No reviews available.</Typography>
        )}
      </Box>
    );
  };

  // ----------------------- Logout Function -----------------------

  /**
   * User Story: As a used car agent, I want to logout so that I can exit the system.
   * Trigger: The agent clicks the logout button.
   */
  const handleLogout = () => {
    // Clear localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('profile');
    localStorage.removeItem('userID'); // Remove userID as well
    setSnackbar({
      open: true,
      message: 'Logged out successfully.',
      severity: 'success',
    });
    // Redirect to login page
    navigate('/login');
  };

  // ----------------------- Snackbar Handler -----------------------

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  // ----------------------- Render Functions -----------------------

  /**
   * User Story: As a used car agent, I want to view used car listings so that I can see the details of the cars.
   * Trigger: The agent navigates to the Listings view.
   */
  // Render Listings Table with Advanced Search
  const renderListings = () => {
    // Calculate the slice of listings to display based on pagination
    const start = listingPage * listingRowsPerPage;
    const end = start + listingRowsPerPage;
    const paginatedListings = filteredListings.slice(start, end);

    return (
      <Box>
        {/* Advanced Search Section */}
        <Box sx={{ display: 'flex', flexDirection: 'column', mb: 2, gap: 2 }}>
          {/* Row 1: Name and Model */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Search by Name"
              variant="outlined"
              value={listingSearchQuery}
              onChange={(e) => setListingSearchQuery(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSearchListings();
                }
              }}
              sx={{ flex: 1 }}
            />
            <FormControl variant="outlined" sx={{ flex: 1 }}>
              <InputLabel id="model-filter-label">Model</InputLabel>
              <Select
                labelId="model-filter-label"
                label="Model"
                value={listingModelFilter}
                onChange={(e) => setListingModelFilter(e.target.value)}
              >
                <MenuItem value="">
                  <em>All Models</em>
                </MenuItem>
                {availableModels.map((model) => (
                  <MenuItem key={model} value={model}>
                    {model}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Row 2: Year and Price Range */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl variant="outlined" sx={{ flex: 1 }}>
              <InputLabel id="year-filter-label">Year</InputLabel>
              <Select
                labelId="year-filter-label"
                label="Year"
                value={listingYearFilter}
                onChange={(e) => setListingYearFilter(e.target.value)}
              >
                <MenuItem value="">
                  <em>All Years</em>
                </MenuItem>
                {availableYears.map((year) => (
                  <MenuItem key={year} value={year}>
                    {year}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl variant="outlined" sx={{ flex: 1 }}>
              <InputLabel id="price-range-filter-label">Price Range</InputLabel>
              <Select
                labelId="price-range-filter-label"
                label="Price Range"
                value={listingPriceRangeFilter}
                onChange={(e) => setListingPriceRangeFilter(e.target.value)}
              >
                <MenuItem value="">
                  <em>All Price Ranges</em>
                </MenuItem>
                {priceRanges.map((range) => (
                  <MenuItem key={range.label} value={range.label}>
                    {range.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Row 3: Search and Reset Buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<SearchIcon />}
              onClick={handleSearchListings}
            >
              Search
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              onClick={handleResetSearch}
            >
              Reset
            </Button>
          </Box>
        </Box>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <Button
            variant="contained"
            color="success"
            startIcon={<AddIcon />}
            onClick={() => setOpenCreateListing(true)}
          >
            Create Listing
          </Button>
        </Box>

        {/* Listings Table */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Make</TableCell>
                  <TableCell>Model</TableCell>
                  <TableCell>Year</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Created At</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedListings.length > 0 ? (
                  paginatedListings.map((listing) => (
                    <TableRow key={listing._id}>
                      <TableCell>{listing.make}</TableCell>
                      <TableCell>{listing.model}</TableCell>
                      <TableCell>{listing.year}</TableCell>
                      <TableCell>${listing.price.toLocaleString()}</TableCell>
                      <TableCell>{new Date(listing.created_at).toLocaleString()}</TableCell>
                      <TableCell align="center">
                        <Button
                          variant="outlined"
                          color="primary"
                          startIcon={<EditIcon />}
                          onClick={() => {
                            setSelectedListing(listing);
                            setUpdatedListingData({
                              make: listing.make,
                              model: listing.model,
                              year: listing.year,
                              price: listing.price,
                            });
                            setOpenUpdateListing(true);
                          }}
                          sx={{ mr: 1 }}
                        >
                          Update
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          startIcon={<DeleteIcon />}
                          onClick={() => {
                            setListingToDelete(listing);
                            setOpenDeleteListing(true);
                          }}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      No listings found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            {/* Pagination Controls */}
            <TablePagination
              component="div"
              count={filteredListings.length}
              page={listingPage}
              onPageChange={(event, newPage) => setListingPage(newPage)}
              rowsPerPage={listingRowsPerPage}
              onRowsPerPageChange={(event) => {
                setListingRowsPerPage(parseInt(event.target.value, 10));
                setListingPage(0); // Reset to first page
              }}
              rowsPerPageOptions={[5, 10, 25]}
              labelRowsPerPage="Listings per page:"
              sx={{ mt: 2 }}
            />
          </>
        )}
      </Box>
    );
  }

    /**
     * User Story: As a used car agent, I want to see a landing page upon login that allows me to navigate to different sections.
     * Trigger: The agent logs into the system.
     */
    // Render Landing Page
    const renderLandingPage = () => {
      return (
        <Box
          sx={{
            height: '80vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography variant="h4" gutterBottom>
            Welcome, {agentInfo ? agentInfo.username : 'Agent'}!
          </Typography>
          <Typography variant="h5" gutterBottom>
            What would you like to do today?
          </Typography>
          <Grid container spacing={4} justifyContent="center" sx={{ mt: 4 }}>
            <Grid item>
              <Card
                sx={{
                  width: 250,
                  height: 250,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: 3,
                  '&:hover': {
                    boxShadow: 6,
                  },
                }}
                onClick={() => handleNavigation('listings')}
              >
                <CardActionArea sx={{ width: '100%', height: '100%' }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <AddIcon sx={{ fontSize: 50, color: 'primary.main', mb: 2 }} />
                    <Typography variant="h6">Manage Listings</Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
            <Grid item>
              <Card
                sx={{
                  width: 250,
                  height: 250,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: 3,
                  '&:hover': {
                    boxShadow: 6,
                  },
                }}
                onClick={() => handleNavigation('reviews')}
              >
                <CardActionArea sx={{ width: '100%', height: '100%' }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <RateReviewIcon sx={{ fontSize: 50, color: 'primary.main', mb: 2 }} />
                    <Typography variant="h6">View Reviews</Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          </Grid>
        </Box>
      );
    };

    // ----------------------- Main Render -----------------------

    return (
      <Box sx={{ display: 'flex' }}>
        {/* Sidebar Drawer */}
        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
          }}
        >
          <Toolbar>
            <Typography variant="h6" noWrap>
              Agent Dashboard
            </Typography>
          </Toolbar>
          <Box sx={{ overflow: 'auto' }}>
            <List>
              {/* Home Button */}
              <ListItem disablePadding>
                <ListItemButton
                  selected={currentView === 'landing'}
                  onClick={() => handleNavigation('landing')}
                >
                  <HomeIcon sx={{ marginRight: 2 }} />
                  <ListItemText primary="Home" />
                </ListItemButton>
              </ListItem>

              {/* Listings Button */}
              <ListItem disablePadding>
                <ListItemButton
                  selected={currentView === 'listings'}
                  onClick={() => handleNavigation('listings')}
                >
                  <AddIcon sx={{ marginRight: 2 }} />
                  <ListItemText primary="Manage Listings" />
                </ListItemButton>
              </ListItem>

              {/* Reviews Button */}
              <ListItem disablePadding>
                <ListItemButton
                  selected={currentView === 'reviews'}
                  onClick={() => handleNavigation('reviews')}
                >
                  <RateReviewIcon sx={{ marginRight: 2 }} />
                  <ListItemText primary="View Reviews" />
                </ListItemButton>
              </ListItem>
            </List>
          </Box>
        </Drawer>

        {/* Main Content */}
        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          {/* AppBar with Logout Button */}
          <AppBar position="static" sx={{ mb: 4, width: `calc(100% - ${drawerWidth}px)`, ml: `${drawerWidth}px` }}>
            <Toolbar>
              <Typography variant="h6" sx={{ flexGrow: 1 }}>
                {currentView === 'listings'
                  ? 'Used Car Listings'
                  : currentView === 'reviews'
                  ? 'Client Reviews'
                  : 'Dashboard'}
              </Typography>
              <Button color="inherit" onClick={handleLogout}>
                Logout
              </Button>
            </Toolbar>
          </AppBar>

          {/* Snackbar for Messages */}
          <Snackbar
            open={snackbar.open}
            autoHideDuration={6000}
            onClose={handleCloseSnackbar}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          >
            <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
              {snackbar.message}
            </Alert>
          </Snackbar>

          {/* Render Content Based on Current View */}
          {currentView === 'landing' && renderLandingPage()}
          {currentView === 'listings' && renderListings()}
          {currentView === 'reviews' && renderReviews()}

          {/* ----------------------- Listings Dialogs ----------------------- */}

          {/* Create Listing Dialog */}
          <Dialog
            open={openCreateListing}
            onClose={() => {
              setOpenCreateListing(false);
              setListingErrors({});
            }}
            fullWidth
            maxWidth="sm"
          >
            <DialogTitle>Create New Listing</DialogTitle>
            <DialogContent>
              <TextField
                label="Make"
                name="make"
                fullWidth
                required
                margin="normal"
                value={newListing.make}
                onChange={(e) => setNewListing({ ...newListing, make: e.target.value })}
                error={Boolean(listingErrors.make)}
                helperText={listingErrors.make}
              />
              <TextField
                label="Model"
                name="model"
                fullWidth
                required
                margin="normal"
                value={newListing.model}
                onChange={(e) => setNewListing({ ...newListing, model: e.target.value })}
                error={Boolean(listingErrors.model)}
                helperText={listingErrors.model}
              />
              <TextField
                label="Year"
                name="year"
                fullWidth
                required
                margin="normal"
                value={newListing.year}
                onChange={(e) => setNewListing({ ...newListing, year: e.target.value })}
                error={Boolean(listingErrors.year)}
                helperText={listingErrors.year}
              />
              <TextField
                label="Price"
                name="price"
                fullWidth
                required
                margin="normal"
                value={newListing.price}
                onChange={(e) => setNewListing({ ...newListing, price: e.target.value })}
                error={Boolean(listingErrors.price)}
                helperText={listingErrors.price}
              />
            </DialogContent>
            <DialogActions>
              <Button
                onClick={() => {
                  setOpenCreateListing(false);
                  setListingErrors({});
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleCreateListing} variant="contained" color="primary" disabled={loading}>
                {loading ? <CircularProgress size={24} /> : 'Create'}
              </Button>
            </DialogActions>
          </Dialog>

          {/* Update Listing Dialog */}
          <Dialog
            open={openUpdateListing}
            onClose={() => {
              setOpenUpdateListing(false);
              setUpdateListingErrors({});
            }}
            fullWidth
            maxWidth="sm"
          >
            <DialogTitle>Update Listing</DialogTitle>
            <DialogContent>
              {selectedListing && (
                <>
                  <Typography variant="subtitle1">
                    Listing ID: {selectedListing._id}
                  </Typography>
                  <TextField
                    label="Make"
                    name="make"
                    fullWidth
                    required
                    margin="normal"
                    value={updatedListingData.make}
                    onChange={(e) => setUpdatedListingData({ ...updatedListingData, make: e.target.value })}
                    error={Boolean(updateListingErrors.make)}
                    helperText={updateListingErrors.make}
                  />
                  <TextField
                    label="Model"
                    name="model"
                    fullWidth
                    required
                    margin="normal"
                    value={updatedListingData.model}
                    onChange={(e) => setUpdatedListingData({ ...updatedListingData, model: e.target.value })}
                    error={Boolean(updateListingErrors.model)}
                    helperText={updateListingErrors.model}
                  />
                  <TextField
                    label="Year"
                    name="year"
                    fullWidth
                    required
                    margin="normal"
                    value={updatedListingData.year}
                    onChange={(e) => setUpdatedListingData({ ...updatedListingData, year: e.target.value })}
                    error={Boolean(updateListingErrors.year)}
                    helperText={updateListingErrors.year}
                  />
                  <TextField
                    label="Price"
                    name="price"
                    fullWidth
                    required
                    margin="normal"
                    value={updatedListingData.price}
                    onChange={(e) => setUpdatedListingData({ ...updatedListingData, price: e.target.value })}
                    error={Boolean(updateListingErrors.price)}
                    helperText={updateListingErrors.price}
                  />
                </>
              )}
            </DialogContent>
            <DialogActions>
              <Button
                onClick={() => {
                  setOpenUpdateListing(false);
                  setUpdateListingErrors({});
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleUpdateListing} variant="contained" color="primary" disabled={loading}>
                {loading ? <CircularProgress size={24} /> : 'Update'}
              </Button>
            </DialogActions>
          </Dialog>

          {/* Delete Listing Dialog */}
          <Dialog
            open={openDeleteListing}
            onClose={() => setOpenDeleteListing(false)}
            fullWidth
            maxWidth="sm"
          >
            <DialogTitle>Delete Listing</DialogTitle>
            <DialogContent>
              {listingToDelete && (
                <Typography>
                  Are you sure you want to delete the listing for <strong>{listingToDelete.make} {listingToDelete.model} ({listingToDelete.year})</strong>?
                </Typography>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenDeleteListing(false)}>Cancel</Button>
              <Button onClick={handleDeleteListing} variant="contained" color="error" disabled={loading}>
                {loading ? <CircularProgress size={24} /> : 'Delete'}
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      </Box>
    );
  };

  export default AgentDashboard;
