// src/components/SellerDashboard.js

import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Drawer,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Snackbar,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  Typography,
  AppBar,
  Toolbar,
  CircularProgress,
  Card,
  CardActionArea,
  CardContent,
  Grid,
  Rating,
  IconButton,
  ListItem, ListItemText, ListItemButton, List
} from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import config from '../config';
import HomeIcon from '@mui/icons-material/Home';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import RateReviewIcon from '@mui/icons-material/RateReview';
import EditReviewIcon from '@mui/icons-material/Edit'; // Icon for editing reviews

// Define the width of the sidebar drawer
const drawerWidth = 240;

// Helper function to format snake_case to Proper Case
const formatLabel = (str) => {
  return str
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const SellerDashboard = () => {
  const navigate = useNavigate();

  // State for Sidebar Navigation
  const [currentView, setCurrentView] = useState('landing'); // 'landing', 'listings', 'shortlists', 'reviews'

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

  // Dynamic Filters with Separate Min and Max State Variables
  const [availableMakes, setAvailableMakes] = useState([]);
  const [selectedMakes, setSelectedMakes] = useState(['All']);

  const [availableModels, setAvailableModels] = useState([]);
  const [selectedModels, setSelectedModels] = useState(['All']);

  const [yearRange, setYearRange] = useState({ min: 0, max: 0 });
  const [selectedMinYear, setSelectedMinYear] = useState(0);
  const [selectedMaxYear, setSelectedMaxYear] = useState(0);

  const [priceRange, setPriceRange] = useState({ min: 0, max: 0 });
  const [selectedMinPrice, setSelectedMinPrice] = useState(0);
  const [selectedMaxPrice, setSelectedMaxPrice] = useState(0);

  const [listingPage, setListingPage] = useState(0);
  const [listingRowsPerPage, setListingRowsPerPage] = useState(5);

  // States for Reviews
  const [allReviews, setAllReviews] = useState([]);
  const [filteredReviews, setFilteredReviews] = useState([]);
  const [selectedReviewRole, setSelectedReviewRole] = useState('');
  const [reviewerRoles, setReviewerRoles] = useState([]);
  const [averageRating, setAverageRating] = useState(null);
 
  // States for Reviews Dialogs
  const [openSubmitReview, setOpenSubmitReview] = useState(false);
  const [openEditReview, setOpenEditReview] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [reviewFormData, setReviewFormData] = useState({
    rating: '',
    review: '',
    reviewer_id: '', // Needed for authorization
  });
  const [reviewErrors, setReviewErrors] = useState({});

  // Retrieve Seller Information from localStorage
  const getSellerInfo = () => {
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

  const sellerInfo = getSellerInfo();
  const userID = sellerInfo ? sellerInfo.userID : null; // Using userID for identification

  // Redirect to login if userID is not found
  useEffect(() => {
    if (!userID) {
      setSnackbar({
        open: true,
        message: 'Seller information not found. Please log in again.',
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

  // Fetch Listings and Shortlists using the new get_metrics_by_seller API
  const fetchListingsAndShortlists = async () => {
    if (!userID) {
      setSnackbar({
        open: true,
        message: 'Seller information not found. Please log in again.',
        severity: 'error',
      });
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      // Fetch all metrics for the seller
      const metricsEndpoint = `${config.API_BASE_URL}/get_metrics/${userID}`;
      const response = await axios.get(metricsEndpoint);

      if (response.status === 200) {
        const sellerListings = response.data.listings;

        if (sellerListings.length === 0) {
          setSnackbar({
            open: true,
            message: 'No listings found for your account.',
            severity: 'info',
          });
          setListings([]);
          setFilteredListings([]);
          return;
        }

        setListings(sellerListings);
        setFilteredListings(sellerListings);

        // Extract unique Makes and Models
        const makes = [...new Set(sellerListings.map((listing) => listing.make))];
        setAvailableMakes(makes);
        setSelectedMakes(['All']);

        const models = [...new Set(sellerListings.map((listing) => listing.model))];
        setAvailableModels(models);
        setSelectedModels(['All']);

        // Determine Year Range
        const years = sellerListings.map((listing) => listing.year);
        const minYear = years.length > 0 ? Math.min(...years) : 0;
        const maxYear = years.length > 0 ? Math.max(...years) : 0;
        setYearRange({ min: minYear, max: maxYear });
        setSelectedMinYear(minYear);
        setSelectedMaxYear(maxYear);

        // Determine Price Range
        const prices = sellerListings.map((listing) => listing.price);
        const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
        const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;
        setPriceRange({ min: minPrice, max: maxPrice });
        setSelectedMinPrice(minPrice);
        setSelectedMaxPrice(maxPrice);
      } else {
        setSnackbar({
          open: true,
          message: 'Failed to fetch listings.',
          severity: 'error',
        });
      }
    } catch (error) {
      console.error('Error fetching listings and shortlists:', error);
      setSnackbar({
        open: true,
        message: 'Failed to fetch listings and shortlists.',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  // Calculate Average Rating
  const calculateAverageRating = (reviews) => {
    if (reviews.length === 0) {
      setAverageRating(null);
      return;
    }
    const total = reviews.reduce((acc, review) => acc + review.rating, 0);
    setAverageRating(total / reviews.length);
  };

  // Fetch Reviews and Extract Reviewer Roles
  const fetchReviews = async () => {
    if (!userID) {
      setSnackbar({
        open: true,
        message: 'Seller information not found. Please log in again.',
        severity: 'error',
      });
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      const endpoint = `${config.API_BASE_URL}/view_reviews/${userID}`;
      const response = await axios.get(endpoint);

      if (response.status === 200) {
        const reviews = response.data.reviews;
        setAllReviews(reviews);
        setFilteredReviews(reviews);
        calculateAverageRating(reviews);

        // Extract unique reviewer roles
        const roles = [...new Set(reviews.map((review) => review.reviewer_role))];
        setReviewerRoles(roles);
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
    if (currentView === 'landing') {
      // No action needed
    } else if (currentView === 'listings' || currentView === 'shortlists') {
      fetchListingsAndShortlists();
    } else if (currentView === 'reviews') {
      fetchReviews();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentView]);

  // ----------------------- Used Car Listings Functions -----------------------
  
  const handleSearchListings = () => {
    let filtered = [...listings];

    // Filter by Search Query (Make or Model)
    if (listingSearchQuery.trim() !== '') {
      const query = listingSearchQuery.trim().toLowerCase();
      filtered = filtered.filter(
        (listing) =>
          listing.make.toLowerCase().includes(query) ||
          listing.model.toLowerCase().includes(query)
      );
    }

    // Filter by Selected Makes
    if (selectedMakes.length > 0 && !selectedMakes.includes('All')) {
      filtered = filtered.filter((listing) => selectedMakes.includes(listing.make));
    }

    // Filter by Selected Models
    if (selectedModels.length > 0 && !selectedModels.includes('All')) {
      filtered = filtered.filter((listing) => selectedModels.includes(listing.model));
    }

    // Filter by Year Range
    if (selectedMinYear !== yearRange.min || selectedMaxYear !== yearRange.max) {
      filtered = filtered.filter(
        (listing) =>
          listing.year >= selectedMinYear && listing.year <= selectedMaxYear
      );
    }

    // Filter by Price Range
    if (selectedMinPrice !== priceRange.min || selectedMaxPrice !== priceRange.max) {
      filtered = filtered.filter(
        (listing) =>
          listing.price >= selectedMinPrice && listing.price <= selectedMaxPrice
      );
    }

    setFilteredListings(filtered);
    setListingPage(0); // Reset to first page after search
  };

  /**
   * User Story: As a seller, I want to reset the search to view all listings.
   * Trigger: The seller clicks the reset search button.
   */
  const handleResetSearch = () => {
    setListingSearchQuery('');
    setSelectedMakes(['All']);
    setSelectedModels(['All']);
    setSelectedMinYear(yearRange.min);
    setSelectedMaxYear(yearRange.max);
    setSelectedMinPrice(priceRange.min);
    setSelectedMaxPrice(priceRange.max);
    setFilteredListings(listings);
    setListingPage(0); // Reset to first page after reset
  };

  // ----------------------- Reviews Functions -----------------------

  /**
   * User Story: As a seller, I want to submit a review for an agent managing my listing.
   * Trigger: The seller clicks "Submit Review" on a listing without a review.
   */
  const handleSubmitReview = async () => {
    if (!validateReviewForm()) return;
    setLoading(true);
    try {
      const payload = {
        agent_id: selectedReview.agent_id,
        seller_id: userID, // Seller is the reviewer
        rating: Number(reviewFormData.rating),
        review: reviewFormData.review,
      };
      const endpoint = `${config.API_BASE_URL}/rate_review_agent`;
      const response = await axios.post(endpoint, payload);
      if (response.status === 201 || response.status === 200) {
        setSnackbar({
          open: true,
          message: 'Review submitted successfully.',
          severity: 'success',
        });
        fetchReviews(); // Refresh reviews
        setOpenSubmitReview(false); // Close dialog
        setSelectedReview(null);
        setReviewFormData({ rating: '', review: '', reviewer_id: '' });
        setReviewErrors({});
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      if (error.response && error.response.data && error.response.data.error) {
        setSnackbar({
          open: true,
          message: error.response.data.error,
          severity: 'error',
        });
      } else {
        setSnackbar({
          open: true,
          message: 'Failed to submit review.',
          severity: 'error',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * User Story: As a seller, I want to edit my submitted reviews so that I can update my feedback on agents.
   * Trigger: The seller selects to edit a review.
   */
  const handleEditReview = async () => {
    if (!validateReviewForm()) return;
    setLoading(true);
    try {
      const payload = {
        reviewer_id: userID, // For authorization
        rating: Number(reviewFormData.rating),
        review: reviewFormData.review,
      };
      const endpoint = `${config.API_BASE_URL}/edit_review_agent/${selectedReview.listing_id}`;
      const response = await axios.put(endpoint, payload);
      if (response.status === 200) {
        setSnackbar({
          open: true,
          message: 'Review updated successfully.',
          severity: 'success',
        });
        fetchReviews(); // Refresh reviews
        setOpenEditReview(false); // Close dialog
        setSelectedReview(null);
        setReviewFormData({ rating: '', review: '', reviewer_id: '' });
        setReviewErrors({});
      }
    } catch (error) {
      console.error('Error editing review:', error);
      if (error.response && error.response.data && error.response.data.error) {
        setSnackbar({
          open: true,
          message: error.response.data.error,
          severity: 'error',
        });
      } else {
        setSnackbar({
          open: true,
          message: 'Failed to edit review.',
          severity: 'error',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Validate Review Form
  const validateReviewForm = () => {
    const errors = {};
    if (!reviewFormData.rating) {
      errors.rating = 'Rating is required.';
    } else if (
      isNaN(reviewFormData.rating) ||
      Number(reviewFormData.rating) < 1 ||
      Number(reviewFormData.rating) > 5
    ) {
      errors.rating = 'Rating must be between 1 and 5.';
    }
    // 'review' is optional
    setReviewErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Render Reviews with Submit/Edit Options
  const renderReviews = () => {
    return (
      <Box>
        <Typography variant="h5" gutterBottom>
          Agent Reviews
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Rating value={averageRating} precision={0.1} readOnly />
          <Typography variant="h6" sx={{ ml: 2 }}>
            {averageRating ? averageRating.toFixed(1) : 'No ratings yet'}
          </Typography>
        </Box>

        {/* Reviewer Role Filter */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <FormControl variant="outlined" sx={{ minWidth: 200 }}>
            <InputLabel id="review-role-filter-label">Filter by Role</InputLabel>
            <Select
              labelId="review-role-filter-label"
              label="Filter by Role"
              value={selectedReviewRole}
              onChange={handleReviewRoleChange}
            >
              <MenuItem value="">
                <em>All Roles</em>
              </MenuItem>
              {reviewerRoles.length > 0 ? (
                reviewerRoles.map((role) => (
                  <MenuItem key={role} value={role}>
                    {role}
                  </MenuItem>
                ))
              ) : (
                <MenuItem value="" disabled>
                  No Roles Available
                </MenuItem>
              )}
            </Select>
          </FormControl>
          {selectedReviewRole && (
            <Button
              variant="outlined"
              color="secondary"
              onClick={handleResetReviewFilter}
              sx={{ ml: 2 }}
            >
              Reset
            </Button>
          )}
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={2}>
            {filteredReviews.map((review) => (
              <Grid item xs={12} md={6} key={review._id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Rating value={review.rating} readOnly />
                      <Typography variant="subtitle1" sx={{ ml: 2 }}>
                        {formatLabel(review.reviewer_role)}
                      </Typography>
                      {/* Edit Review Button */}
                      <IconButton
                        aria-label="edit review"
                        color="primary"
                        sx={{ marginLeft: 'auto' }}
                        onClick={() => {
                          setSelectedReview(review);
                          setReviewFormData({
                            rating: review.rating,
                            review: review.review,
                            reviewer_id: userID, // Current user's ID
                          });
                          setOpenEditReview(true);
                        }}
                      >
                        <EditReviewIcon />
                      </IconButton>
                    </Box>
                    <Typography variant="body1">{review.review || 'No comments provided.'}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(review.created_at).toLocaleString()}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}

            {/* If no reviews */}
            {filteredReviews.length === 0 && (
              <Typography>No reviews available.</Typography>
            )}
          </Grid>
        )}

        {/* ----------------------- Submit Review Dialog ----------------------- */}

        {/* The Submit Review button will be associated with each listing without a review */}
        {/* This dialog is triggered when the user clicks "Submit Review" */}
        <Dialog
          open={openSubmitReview}
          onClose={() => {
            setOpenSubmitReview(false);
            setReviewErrors({});
          }}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>Submit Review</DialogTitle>
          <DialogContent>
            <Typography variant="subtitle1" gutterBottom>
              Listing: {selectedReview && `${selectedReview.make} ${selectedReview.model} (${selectedReview.year})`}
            </Typography>
            <FormControl fullWidth margin="normal">
              <InputLabel id="submit-review-agent-label">Agent</InputLabel>
              <Select
                labelId="submit-review-agent-label"
                label="Agent"
                value={selectedReview ? selectedReview.agent_id : ''}
                disabled
              >
                {/* Assuming you have a list of agents; replace with actual data */}
                {/* Example:
                {agents.map((agent) => (
                  <MenuItem key={agent._id} value={agent._id}>
                    {agent.name}
                  </MenuItem>
                ))}
                */}
              </Select>
            </FormControl>

            <FormControl fullWidth margin="normal">
              <InputLabel id="submit-review-rating-label">Rating</InputLabel>
              <Select
                labelId="submit-review-rating-label"
                label="Rating"
                value={reviewFormData.rating}
                onChange={(e) =>
                  setReviewFormData({ ...reviewFormData, rating: e.target.value })
                }
                error={Boolean(reviewErrors.rating)}
              >
                {[1, 2, 3, 4, 5].map((num) => (
                  <MenuItem key={num} value={num}>
                    {num} Star{num > 1 ? 's' : ''}
                  </MenuItem>
                ))}
              </Select>
              {reviewErrors.rating && (
                <Typography variant="caption" color="error">
                  {reviewErrors.rating}
                </Typography>
              )}
            </FormControl>

            <TextField
              label="Review"
              name="review"
              fullWidth
              multiline
              rows={4}
              margin="normal"
              value={reviewFormData.review}
              onChange={(e) =>
                setReviewFormData({ ...reviewFormData, review: e.target.value })
              }
              error={Boolean(reviewErrors.review)}
              helperText={reviewErrors.review}
            />
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                setOpenSubmitReview(false);
                setReviewErrors({});
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitReview}
              variant="contained"
              color="primary"
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Submit'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* ----------------------- Edit Review Dialog ----------------------- */}

        <Dialog
          open={openEditReview}
          onClose={() => {
            setOpenEditReview(false);
            setReviewErrors({});
          }}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>Edit Review</DialogTitle>
          <DialogContent>
            <Typography variant="subtitle1" gutterBottom>
              Listing: {selectedReview && `${selectedReview.make} ${selectedReview.model} (${selectedReview.year})`}
            </Typography>
            <FormControl fullWidth margin="normal">
              <InputLabel id="edit-review-agent-label">Agent</InputLabel>
              <Select
                labelId="edit-review-agent-label"
                label="Agent"
                value={selectedReview ? selectedReview.agent_id : ''}
                disabled
              >
                {/* Assuming you have a list of agents; replace with actual data */}
                {/* Example:
                {agents.map((agent) => (
                  <MenuItem key={agent._id} value={agent._id}>
                    {agent.name}
                  </MenuItem>
                ))}
                */}
              </Select>
            </FormControl>

            <FormControl fullWidth margin="normal">
              <InputLabel id="edit-review-rating-label">Rating</InputLabel>
              <Select
                labelId="edit-review-rating-label"
                label="Rating"
                value={reviewFormData.rating}
                onChange={(e) =>
                  setReviewFormData({ ...reviewFormData, rating: e.target.value })
                }
                error={Boolean(reviewErrors.rating)}
              >
                {[1, 2, 3, 4, 5].map((num) => (
                  <MenuItem key={num} value={num}>
                    {num} Star{num > 1 ? 's' : ''}
                  </MenuItem>
                ))}
              </Select>
              {reviewErrors.rating && (
                <Typography variant="caption" color="error">
                  {reviewErrors.rating}
                </Typography>
              )}
            </FormControl>

            <TextField
              label="Review"
              name="review"
              fullWidth
              multiline
              rows={4}
              margin="normal"
              value={reviewFormData.review}
              onChange={(e) =>
                setReviewFormData({ ...reviewFormData, review: e.target.value })
              }
              error={Boolean(reviewErrors.review)}
              helperText={reviewErrors.review}
            />
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                setOpenEditReview(false);
                setReviewErrors({});
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleEditReview}
              variant="contained"
              color="primary"
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Update'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    )  };

  /**
   * User Story: As a seller, I want to see a landing page upon login that allows me to navigate to different sections.
   * Trigger: The seller logs into the system.
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
          Welcome, {sellerInfo ? sellerInfo.username : 'Seller'}!
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
                  <Typography variant="h6">View Metrics</Typography>
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
                  <EditReviewIcon sx={{ fontSize: 50, color: 'primary.main', mb: 2 }} />
                  <Typography variant="h6">View Reviews</Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        </Grid>
      </Box>
    );
  };

  // ----------------------- Render Listings -----------------------

  const renderListings = () => {
    // Calculate the slice of listings to display based on pagination
    const start = listingPage * listingRowsPerPage;
    const end = start + listingRowsPerPage;
    const paginatedListings = filteredListings.slice(start, end);

    return (
      <Box>
        {/* Search Bar */}
        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
          <TextField
            label="Search by Make or Model"
            variant="outlined"
            value={listingSearchQuery}
            onChange={(e) => setListingSearchQuery(e.target.value)}
            fullWidth
          />
          <Button
            variant="contained"
            color="primary"
            startIcon={<SearchIcon />}
            onClick={handleSearchListings}
          >
            Search
          </Button>
        </Box>

        {/* Advanced Filter Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Advanced Filters
          </Typography>
          <Grid container spacing={3}>
            {/* Make Filter */}
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel id="make-filter-label">Make</InputLabel>
                <Select
                  labelId="make-filter-label"
                  multiple
                  value={selectedMakes}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value.includes('All')) {
                      setSelectedMakes(['All']);
                    } else {
                      setSelectedMakes(value);
                    }
                  }}
                  label="Make"
                  renderValue={(selected) => selected.join(', ')}
                >
                  {/* 'All' Option */}
                  <MenuItem value="All">
                    <Checkbox checked={selectedMakes.includes('All')} />
                    <ListItemText primary="All" />
                  </MenuItem>
                  {availableMakes.map((make) => (
                    <MenuItem key={make} value={make}>
                      <Checkbox checked={selectedMakes.includes(make)} />
                      <ListItemText primary={make} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Model Filter */}
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel id="model-filter-label">Model</InputLabel>
                <Select
                  labelId="model-filter-label"
                  multiple
                  value={selectedModels}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value.includes('All')) {
                      setSelectedModels(['All']);
                    } else {
                      setSelectedModels(value);
                    }
                  }}
                  label="Model"
                  renderValue={(selected) => selected.join(', ')}
                >
                  {/* 'All' Option */}
                  <MenuItem value="All">
                    <Checkbox checked={selectedModels.includes('All')} />
                    <ListItemText primary="All" />
                  </MenuItem>
                  {availableModels.map((model) => (
                    <MenuItem key={model} value={model}>
                      <Checkbox checked={selectedModels.includes(model)} />
                      <ListItemText primary={model} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Spacer Grid Item to Create Vertical Space */}
            <Grid item xs={12} />

            {/* Year Range Filter with Input Boxes */}
            <Grid item xs={12} md={3}>
              <Typography gutterBottom>Year Range</Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  label="Min Year"
                  type="number"
                  value={selectedMinYear}
                  onChange={(e) => setSelectedMinYear(Number(e.target.value))}
                  fullWidth
                  InputProps={{ inputProps: { min: yearRange.min, max: yearRange.max } }}
                />
                <TextField
                  label="Max Year"
                  type="number"
                  value={selectedMaxYear}
                  onChange={(e) => setSelectedMaxYear(Number(e.target.value))}
                  fullWidth
                  InputProps={{ inputProps: { min: yearRange.min, max: yearRange.max } }}
                />
              </Box>
            </Grid>

            {/* Price Range Filter with Input Boxes */}
            <Grid item xs={12} md={3}>
              <Typography gutterBottom>Price Range ($)</Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  label="Min Price"
                  type="number"
                  value={selectedMinPrice}
                  onChange={(e) => setSelectedMinPrice(Number(e.target.value))}
                  fullWidth
                  InputProps={{ inputProps: { min: priceRange.min, max: priceRange.max } }}
                />
                <TextField
                  label="Max Price"
                  type="number"
                  value={selectedMaxPrice}
                  onChange={(e) => setSelectedMaxPrice(Number(e.target.value))}
                  fullWidth
                  InputProps={{ inputProps: { min: priceRange.min, max: priceRange.max } }}
                />
              </Box>
            </Grid>
          </Grid>
          {/* Filter Actions */}
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<SearchIcon />}
              onClick={handleSearchListings}
            >
              Apply Filters
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              onClick={handleResetSearch}
            >
              Reset Filters
            </Button>
          </Box>
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
                  <TableCell>Views</TableCell>
                  <TableCell>Shortlists</TableCell>
                  <TableCell>Created At</TableCell> 
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedListings.length > 0 ? (
                  paginatedListings.map((listing) => (
                    <TableRow key={listing.listing_id}>
                      <TableCell>{listing.make}</TableCell>
                      <TableCell>{listing.model}</TableCell>
                      <TableCell>{listing.year}</TableCell>
                      <TableCell>${listing.price.toLocaleString()}</TableCell>
                      <TableCell>{listing.views}</TableCell>
                      <TableCell>{listing.shortlists}</TableCell>
                      <TableCell>{new Date(listing.created_at).toLocaleString()}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
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
      </Box>)
    };

  // Handle Review Role Change
  const handleReviewRoleChange = (event) => {
    const role = event.target.value;
    setSelectedReviewRole(role);
    applyReviewFilter(role);
  };

  // Reset Review Filter
  const handleResetReviewFilter = () => {
    setSelectedReviewRole('');
    setFilteredReviews(allReviews);
  };

  // Apply Review Filter
  const applyReviewFilter = (role) => {
    if (!role) {
      setFilteredReviews(allReviews);
      return;
    }
    const filtered = allReviews.filter(
      (review) => review.reviewer_role.toLowerCase() === role.toLowerCase()
    );
    setFilteredReviews(filtered);
  };

  // ----------------------- Logout Function -----------------------

  /**
   * User Story: As a seller, I want to logout so that I can exit the system.
   * Trigger: The seller clicks the logout button.
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
   * User Story: As a seller, I want to see a landing page upon login that allows me to navigate to different sections.
   * Trigger: The seller logs into the system.
   */
  // Render Landing Page

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
            Seller Dashboard
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
                <RateReviewIcon sx={{ marginRight: 2 }} />
                <ListItemText primary="View Metrics" />
              </ListItemButton>
            </ListItem>

            {/* Reviews Button */}
            <ListItem disablePadding>
              <ListItemButton
                selected={currentView === 'reviews'}
                onClick={() => handleNavigation('reviews')}
              >
                <EditReviewIcon sx={{ marginRight: 2 }} />
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
                : currentView === 'shortlists'
                ? 'Shortlist Statistics'
                : currentView === 'reviews'
                ? 'Agent Reviews'
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
      </Box>
    </Box>
  );
}

export default SellerDashboard;
