// src/components/AgentDashboard.js

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
  Slider,
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
  List,
  ListItem,
  ListItemButton,
  ListItemText,
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

  // Dynamic Filters
  const [availableMakes, setAvailableMakes] = useState([]);
  const [selectedMakes, setSelectedMakes] = useState([]);

  const [availableModels, setAvailableModels] = useState([]);
  const [selectedModels, setSelectedModels] = useState([]);

  const [yearRange, setYearRange] = useState([0, 0]);
  const [selectedYearRange, setSelectedYearRange] = useState([0, 0]);

  const [priceRange, setPriceRange] = useState([0, 0]);
  const [selectedPriceRange, setSelectedPriceRange] = useState([0, 0]);

  const [listingPage, setListingPage] = useState(0);
  const [listingRowsPerPage, setListingRowsPerPage] = useState(5);

  // States for Reviews
  const [allReviews, setAllReviews] = useState([]);
  const [filteredReviews, setFilteredReviews] = useState([]);
  const [selectedReviewRole, setSelectedReviewRole] = useState('');
  const [reviewerRoles, setReviewerRoles] = useState([]);
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

  // Fetch Listings and Dynamically Set Filters
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

        // Extract unique Makes and Models
        const makes = [...new Set(agentListings.map((listing) => listing.make))];
        setAvailableMakes(makes);
        setSelectedMakes(makes); // Default all makes selected

        const models = [...new Set(agentListings.map((listing) => listing.model))];
        setAvailableModels(models);
        setSelectedModels(models); // Default all models selected

        // Determine Year Range
        const years = agentListings.map((listing) => listing.year);
        const minYear = years.length > 0 ? Math.min(...years) : 0;
        const maxYear = years.length > 0 ? Math.max(...years) : 0;
        setYearRange([minYear, maxYear]);
        setSelectedYearRange([minYear, maxYear]);

        // Determine Price Range
        const prices = agentListings.map((listing) => listing.price);
        const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
        const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;
        setPriceRange([minPrice, maxPrice]);
        setSelectedPriceRange([minPrice, maxPrice]);
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
      const endpoint = `${config.API_BASE_URL}/used_car_agent/view_reviews/${userID}`;
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
    if (selectedYearRange[0] !== yearRange[0] || selectedYearRange[1] !== yearRange[1]) {
      filtered = filtered.filter(
        (listing) =>
          listing.year >= selectedYearRange[0] && listing.year <= selectedYearRange[1]
      );
    }

    // Filter by Price Range
    if (selectedPriceRange[0] !== priceRange[0] || selectedPriceRange[1] !== priceRange[1]) {
      filtered = filtered.filter(
        (listing) =>
          listing.price >= selectedPriceRange[0] && listing.price <= selectedPriceRange[1]
      );
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
    setSelectedMakes(['All']);
    setSelectedModels(['All']);
    setSelectedYearRange(yearRange);
    setSelectedPriceRange(priceRange);
    setFilteredListings(listings);
    setListingPage(0); // Reset to first page after reset
  };

 
 

  // ----------------------- Render Functions -----------------------
 

  // Render Listings with Advanced Filters
  const renderListings = () => {
    // Calculate the slice of listings to display based on pagination
    const start = listingPage * listingRowsPerPage;
    const end = start + listingRowsPerPage;
    const paginatedListings = filteredListings.slice(start, end);

    return (
      <Box>
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
                      setSelectedMakes(availableMakes);
                    } else {
                      setSelectedMakes(value);
                    }
                  }}
                  label="Make"
                  renderValue={(selected) => selected.join(', ')}
                >
                  {/* 'All' Option */}
                  <MenuItem value="All">
                    <Checkbox checked={selectedMakes.length === availableMakes.length} />
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
                      setSelectedModels(availableModels);
                    } else {
                      setSelectedModels(value);
                    }
                  }}
                  label="Model"
                  renderValue={(selected) => selected.join(', ')}
                >
                  {/* 'All' Option */}
                  <MenuItem value="All">
                    <Checkbox checked={selectedModels.length === availableModels.length} />
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

            {/* Year Range Filter */}
            <Grid item xs={12} md={3}>
              <Typography gutterBottom>Year Range</Typography>
              <Slider
                value={selectedYearRange}
                onChange={(e, newValue) => setSelectedYearRange(newValue)}
                valueLabelDisplay="auto"
                min={yearRange[0]}
                max={yearRange[1]}
                marks={[
                  { value: yearRange[0], label: yearRange[0].toString() },
                  { value: yearRange[1], label: yearRange[1].toString() },
                ]}
              />
            </Grid>

            {/* Price Range Filter */}
            <Grid item xs={12} md={3}>
              <Typography gutterBottom>Price Range ($)</Typography>
              <Slider
                value={selectedPriceRange}
                onChange={(e, newValue) => setSelectedPriceRange(newValue)}
                valueLabelDisplay="auto"
                min={priceRange[0]}
                max={priceRange[1]}
                marks={[
                  { value: priceRange[0], label: `$${priceRange[0].toLocaleString()}` },
                  { value: priceRange[1], label: `$${priceRange[1].toLocaleString()}` },
                ]}
              />
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
         
        )} </Box>)}
      

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
        ) : filteredReviews.length > 0 ? (
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
            <FormControl fullWidth margin="normal">
              <InputLabel id="create-make-label">Make</InputLabel>
              <Select
                labelId="create-make-label"
                label="Make"
                value={newListing.make}
                onChange={(e) => setNewListing({ ...newListing, make: e.target.value })}
                error={Boolean(listingErrors.make)}
              >
                {availableMakes.map((make) => (
                  <MenuItem key={make} value={make}>
                    {make}
                  </MenuItem>
                ))}
              </Select>
              {listingErrors.make && (
                <Typography variant="caption" color="error">
                  {listingErrors.make}
                </Typography>
              )}
            </FormControl>

            <FormControl fullWidth margin="normal">
              <InputLabel id="create-model-label">Model</InputLabel>
              <Select
                labelId="create-model-label"
                label="Model"
                value={newListing.model}
                onChange={(e) => setNewListing({ ...newListing, model: e.target.value })}
                error={Boolean(listingErrors.model)}
              >
                {availableModels.map((model) => (
                  <MenuItem key={model} value={model}>
                    {model}
                  </MenuItem>
                ))}
              </Select>
              {listingErrors.model && (
                <Typography variant="caption" color="error">
                  {listingErrors.model}
                </Typography>
              )}
            </FormControl>

            <TextField
              label="Year"
              name="year"
              fullWidth
              required
              margin="normal"
              type="number"
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
              type="number"
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
                <Typography variant="subtitle1" gutterBottom>
                  Listing ID: {selectedListing._id}
                </Typography>
                <FormControl fullWidth margin="normal">
                  <InputLabel id="update-make-label">Make</InputLabel>
                  <Select
                    labelId="update-make-label"
                    label="Make"
                    value={updatedListingData.make}
                    onChange={(e) => setUpdatedListingData({ ...updatedListingData, make: e.target.value })}
                    error={Boolean(updateListingErrors.make)}
                  >
                    {availableMakes.map((make) => (
                      <MenuItem key={make} value={make}>
                        {make}
                      </MenuItem>
                    ))}
                  </Select>
                  {updateListingErrors.make && (
                    <Typography variant="caption" color="error">
                      {updateListingErrors.make}
                    </Typography>
                  )}
                </FormControl>

                <FormControl fullWidth margin="normal">
                  <InputLabel id="update-model-label">Model</InputLabel>
                  <Select
                    labelId="update-model-label"
                    label="Model"
                    value={updatedListingData.model}
                    onChange={(e) => setUpdatedListingData({ ...updatedListingData, model: e.target.value })}
                    error={Boolean(updateListingErrors.model)}
                  >
                    {availableModels.map((model) => (
                      <MenuItem key={model} value={model}>
                        {model}
                      </MenuItem>
                    ))}
                  </Select>
                  {updateListingErrors.model && (
                    <Typography variant="caption" color="error">
                      {updateListingErrors.model}
                    </Typography>
                  )}
                </FormControl>

                <TextField
                  label="Year"
                  name="year"
                  fullWidth
                  required
                  margin="normal"
                  type="number"
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
                  type="number"
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
