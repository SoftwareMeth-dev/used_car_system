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
    seller_username: '',
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

  // States for Sellers
  const [sellers, setSellers] = useState([]); // List of sellers
  const [selectedSellerUsername, setSelectedSellerUsername] = useState(''); // Selected seller's username


  const titleMap = {
    landing: 'Agent Dashboard',
    listings: 'Agent Dashboard - Listings',
    reviews: 'Agent Dashboard - Reviews', 
  };
  // Set the document title based on currentView
  useEffect(() => {
    const title = titleMap[currentView] || 'Agent Dashboard';
    document.title = title;
  }, [currentView]);



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
      const endpoint = `${config.API_BASE_URL}/view_listings`;
      const params = { agent_id: userID }; // Pass userID as agent identifier
  
      const response = await axios.get(endpoint, { params });
      if (response.status === 200) {
        // Frontend filter to ensure only agent's listings are displayed
        const agentListings = response.data.listings.filter(
          (listing) => listing.agent_id === userID
        );
        console.log('Agent Listings:', agentListings);
        console.log(agentListings);
        // Extract unique seller_ids to minimize API calls
        const uniqueSellerIds = [...new Set(agentListings.map(listing => listing.seller_id))];
  
        // Object to store seller_id to username mapping
        const sellerIdToUsernameMap = {};
  
        // Fetch user data for each unique seller_id
        await Promise.all(uniqueSellerIds.map(async (seller_id) => {
          try {
            const userResponse = await axios.get(`${config.API_BASE_URL}/get_user_id`, {
              params: { userid: seller_id }
            });
  
            if (userResponse.status === 200 && userResponse.data.user) {
              sellerIdToUsernameMap[seller_id] = userResponse.data.user.username;
            } else {
              // Handle cases where user data is not found
              sellerIdToUsernameMap[seller_id] = 'Unknown Seller';
              console.warn(`User not found for seller_id: ${seller_id}`);
            }
          } catch (error) {
            // Handle request errors
            console.error(`Error fetching user for seller_id ${seller_id}:`, error);
            sellerIdToUsernameMap[seller_id] = 'Unknown Seller';
          }
        }));
        console.log(sellerIdToUsernameMap);
        // Append seller_username to each listing
        const listingsWithUsernames = agentListings.map(listing => ({
          ...listing,
          seller_username: sellerIdToUsernameMap[listing.seller_id] || 'Unknown Seller'
        }));
  
        setListings(listingsWithUsernames);
        setFilteredListings(listingsWithUsernames);
  
        // Determine Year Range
        const years = listingsWithUsernames.map((listing) => listing.year);
        const minYear = years.length > 0 ? Math.min(...years) : 0;
        const maxYear = years.length > 0 ? Math.max(...years) : 0;
        setYearRange([minYear, maxYear]);
        setSelectedYearRange([minYear, maxYear]);
  
        // Determine Price Range
        const prices = listingsWithUsernames.map((listing) => listing.price);
        const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
        const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;
        setPriceRange([minPrice, maxPrice]);
        setSelectedPriceRange([minPrice, maxPrice]);
      } else {
        // Handle unexpected response statuses
        console.error('Unexpected response status:', response.status);
        setSnackbar({
          open: true,
          message: 'Unexpected error occurred. Please try again later.',
          severity: 'error',
        });
      }
    } catch (error) {
      console.error('Error fetching listings:', error);
      setSnackbar({
        open: true,
        message: 'Failed to fetch listings. Please try again later.',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch Sellers from Backend
  const fetchSellers = async () => {
    setLoading(true);
    try {
      // Adjust the params based on your backend implementation
      const response = await axios.get(`${config.API_BASE_URL}/view_users`, {
        params: { role: 'seller' }, // Assuming the backend can filter by role
      });

      if (response.status === 200) {
        setSellers(response.data.users);
      } else {
        setSnackbar({
          open: true,
          message: 'Failed to fetch sellers.',
          severity: 'error',
        });
      }
    } catch (error) {
      console.error('Error fetching sellers:', error);
      setSnackbar({
        open: true,
        message: 'An error occurred while fetching sellers.',
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
    if (!selectedSellerUsername) {
      errors.seller_username = 'Seller username is required.';
    }
    setListingErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // US #14
  const handleCreateListing = async () => {
    if (!validateCreateListing()) return;

    setLoading(true);
    try {
      // Step 1: Get seller_id from selectedSellerUsername
      const sellerIdResponse = await axios.get(`${config.API_BASE_URL}/get_id_from_username`, {
        params: { username: selectedSellerUsername },
      });

      if (sellerIdResponse.status !== 200) {
        setSnackbar({
          open: true,
          message: 'Failed to retrieve seller ID.',
          severity: 'error',
        });
        return;
      }

      const seller_id = sellerIdResponse.data.user_id;

      // Step 2: Create listing payload including seller_id
      const payload = {
        agent_id: userID, // Agent's ID
        seller_id: seller_id, // Seller's ID
        make: newListing.make,
        model: newListing.model,
        year: Number(newListing.year),
        price: Number(newListing.price),
      };

      // Step 3: Send create listing request
      const response = await axios.post(`${config.API_BASE_URL}/create_listing`, payload);

      if (response.status === 201) {
        setSnackbar({
          open: true,
          message: 'Listing created successfully.',
          severity: 'success',
        });
        fetchListings(); // Refresh listings
        setOpenCreateListing(false); // Close dialog
        setNewListing({ make: '', model: '', year: '', price: '', seller_username: '' }); // Reset form
        setSelectedSellerUsername(''); // Reset selected seller
        setListingErrors({});
      }
    } catch (error) {
      console.error('Error creating listing:', error);
      if (error.response && error.response.status === 404) {
        setSnackbar({
          open: true,
          message: 'Selected seller not found.',
          severity: 'error',
        });
      } else if (error.response && error.response.data && error.response.data.error) {
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

  // US #16
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
        `${config.API_BASE_URL}/update_listing/${selectedListing._id}`,
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

  // US #17
  const handleDeleteListing = async () => {
    setLoading(true);
    try {
      // Use listing's _id as the identifier
      const response = await axios.delete(`${config.API_BASE_URL}/delete_listing/${listingToDelete._id}`);
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

  // US #18
  const handleSearchListings = () => {
    let filtered = [...listings];

    // Filter by Selected Makes
    if (selectedMakes.length > 0 && !selectedMakes.includes('All')) {
      filtered = filtered.filter((listing) => 
        selectedMakes.some(
          (make) => listing.make.toLowerCase().includes(make.toLowerCase())));
    }

    // Filter by Selected Models
    if (selectedModels.length > 0 && !selectedModels.includes('All')) {
      filtered = filtered.filter((listing) => 
        selectedModels.some(
          (model) => listing.model.toLowerCase().includes(model.toLowerCase())));
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
    setSelectedMakes(availableMakes); // Reset to all available makes
    setSelectedModels(availableModels); // Reset to all available models
    setSelectedYearRange(yearRange);
    setSelectedPriceRange(priceRange);
    setFilteredListings(listings);
    setListingPage(0); // Reset to first page after reset
  };
 
  // Render Listings with Advanced Filters

  // US #15
  const renderListings = () => {
    // Calculate the slice of listings to display based on pagination
    const start = listingPage * listingRowsPerPage;
    const end = start + listingRowsPerPage;
    const paginatedListings = filteredListings.slice(start, end);

    return (
      <Box sx={{ m:1 }}>
        {/* Search and Filters Section */}
        <Box sx={{ display: 'flex', flexDirection: 'column', mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            Search Used Car Listings
          </Typography>
        {/* Advanced Filter Section */}
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Grid container spacing={3}>
            {/* Make Filter */}
            <Grid item xs={12} md={3}>
              <TextField
                label="Make"
                variant="outlined"
                fullWidth
                value={selectedMakes.join(', ')}
                onChange={(e) => {
                  const value = e.target.value;
                  const makes = value.split(',').map((make) => make.trim()).filter((make) => make !== '');
                  setSelectedMakes(makes);
                }}
              />
            </Grid>

            {/* Model Filter */}
            <Grid item xs={12} md={3}>
              <TextField
                label="Model"
                variant="outlined"
                fullWidth
                value={selectedModels.join(', ')}
                onChange={(e) => {
                  const value = e.target.value;
                  const models = value.split(',').map((model) => model.trim()).filter((model) => model !== '');
                  setSelectedModels(models);
                }}
              />
            </Grid>

            {/* Year Range Filter */}
            <Grid item xs={12} md={3}>
              <TextField
                label="Year From"
                variant="outlined"
                fullWidth
                type="number"
                value={selectedYearRange[0]}
                onChange={(e) => setSelectedYearRange([Number(e.target.value), selectedYearRange[1]])}
                InputProps={{ inputProps: { min: yearRange[0], max: yearRange[1] } }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                label="Year To"
                variant="outlined"
                fullWidth
                type="number"
                value={selectedYearRange[1]}
                onChange={(e) => setSelectedYearRange([selectedYearRange[0], Number(e.target.value)])}
                InputProps={{ inputProps: { min: yearRange[0], max: yearRange[1] } }}
              />
            </Grid>

            {/* Price Range Filter */}
            <Grid item xs={12} md={3}>
              <TextField
                label="Price From ($)"
                variant="outlined"
                fullWidth
                type="number"
                value={selectedPriceRange[0]}
                onChange={(e) => setSelectedPriceRange([Number(e.target.value), selectedPriceRange[1]])}
                InputProps={{ inputProps: { min: priceRange[0], max: priceRange[1] } }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                label="Price To ($)"
                variant="outlined"
                fullWidth
                type="number"
                value={selectedPriceRange[1]}
                onChange={(e) => setSelectedPriceRange([selectedPriceRange[0], Number(e.target.value)])}
                InputProps={{ inputProps: { min: priceRange[0], max: priceRange[1] } }}
              />
            </Grid>
          </Grid>
        </Box>
        <Box sx={{ mt: 2, display: 'flex', gap: 2}}>
          {/* US #18 */}
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
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => {
              setOpenCreateListing(true);
              fetchSellers(); // Fetch sellers when dialog opens
            }}
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
                  <TableCell>Seller </TableCell> {/* Added Seller Column */}
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
                      <TableCell>{listing.seller_username}</TableCell> {/* Display Seller Username */}
                      <TableCell>{new Date(listing.created_at).toLocaleString()}</TableCell>
                      <TableCell align="center">
                        <Button
                          variant="contained"
                          color="info"
                          startIcon={<EditIcon />}
                          onClick={() => {
                            setSelectedListing(listing);
                            console.log(listing);
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
                    <TableCell colSpan={7} align="center">
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
  )  };
  
  /**
   * User Story: As a used car agent, I want to view the ratings and reviews so that I can understand client feedback and improve my services.
   * Trigger: The agent navigates to the Reviews view.
   */

  // US #36
  const renderReviews = () => {
    return (
      <Box sx= {{ m:1 }}>
        <Typography variant="h6" gutterBottom>
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

  // US #20
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
              // US #15
              onClick={() => handleNavigation('listings')}
            >
              <CardActionArea sx={{ width: '100%', height: '100%' }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <AddIcon sx={{ fontSize: 50, color: 'primary.main', mb: 2 }} />
                  <Typography variant="h6">View Used Car Listings</Typography>
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
              // US #36
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
            Used Car Agent
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
                <ListItemText primary="Used Car Listings" />
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
      <Box component="main" sx={{ flexGrow: 1 }}>
        {/* AppBar with Logout Button */}
        <AppBar position="static" sx={{ mb: 4 }}>
          <Toolbar>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              {currentView === 'listings'
                ? 'Used Car Listings'
                : currentView === 'reviews'
                ? 'Reviews'
                : 'Dashboard'}
            </Typography>
            {/* US #20 */}
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
            setSelectedSellerUsername('');
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
            <FormControl fullWidth margin="normal">
              <InputLabel id="create-seller-label">Seller Username</InputLabel>
              <Select
                labelId="create-seller-label"
                label="Seller Username"
                value={selectedSellerUsername}
                onChange={(e) => setSelectedSellerUsername(e.target.value)}
                error={Boolean(listingErrors.seller_username)}
              >
                {sellers.map((seller) => (
                  <MenuItem key={seller._id} value={seller.username}>
                    {seller.username}
                  </MenuItem>
                ))}
              </Select>
              {listingErrors.seller_username && (
                <Typography variant="caption" color="error">
                  {listingErrors.seller_username}
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
              value={newListing.year || ''}
              onChange={(e) => setNewListing({ ...newListing, year: e.target.value })}
              error={Boolean(listingErrors.year)}
              helperText={listingErrors.year}
            /> 
            <TextField
              label="Price ($)"
              name="price"
              fullWidth
              required
              margin="normal"
              type="number"
              value={newListing.price || ''}
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
                setSelectedSellerUsername('');
              }}
            >
              Cancel
            </Button>
            {/* US #14 */}
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
                  type="number"
                  value={updatedListingData.year}
                  onChange={(e) => setUpdatedListingData({ ...updatedListingData, year: e.target.value })}
                  error={Boolean(updateListingErrors.year)}
                  helperText={updateListingErrors.year}
                />
                <TextField
                  label="Price ($)"
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
            {/* US #16 */}
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
            {/* US #17 */}
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
