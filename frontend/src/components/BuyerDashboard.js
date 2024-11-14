// src/components/BuyerDashboard.js

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
  IconButton,
  Checkbox,
  ListItemText,
  ListItem,
  ListItemButton, List
} from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import config from '../config';
import HomeIcon from '@mui/icons-material/Home';
import AddIcon from '@mui/icons-material/Add';
import RateReviewIcon from '@mui/icons-material/RateReview';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';

const drawerWidth = 240;

// Helper function to format snake_case to Proper Case
const formatLabel = (str) => {
  return str
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const BuyerDashboard = () => {
  const navigate = useNavigate();

  // State for Sidebar Navigation
  const [currentView, setCurrentView] = useState('landing'); // 'landing', 'listings', 'shortlists'

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

  // States for Shortlists
  const [shortlists, setShortlists] = useState([]);
  const [filteredShortlists, setFilteredShortlists] = useState([]);
  const [shortlistPage, setShortlistPage] = useState(0);
  const [shortlistRowsPerPage, setShortlistRowsPerPage] = useState(5);

  // States for View More Dialog
  const [openViewMore, setOpenViewMore] = useState(false);
  const [selectedListing, setSelectedListing] = useState(null);
  const [sellerUsername, setSellerUsername] = useState('');

  // State to manage shortlisted listings
  const [shortlistedListings, setShortlistedListings] = useState([]);

  // State for Shortlist Feedback
  const [isShortlisting, setIsShortlisting] = useState(false);

  // Mapping of view titles
  const titleMap = {
    landing: 'Buyer Dashboard',
    listings: 'Buyer Dashboard - Used Car Listings',
    shortlists: 'Buyer Dashboard - Shortlists',
  };

  // Set the document title based on currentView
  useEffect(() => {
    const title = titleMap[currentView] || 'Buyer Dashboard';
    document.title = title;
  }, [currentView]);

  // Retrieve Buyer Information from localStorage
  const getBuyerInfo = () => {
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

  const buyerInfo = getBuyerInfo();
  const userID = buyerInfo ? buyerInfo.userID : null; // Using userID for identification
  const username = buyerInfo ? buyerInfo.username : null;

  // Redirect to login if userID is not found
  useEffect(() => {
    if (!userID) {
      setSnackbar({
        open: true,
        message: 'Buyer information not found. Please log in again.',
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
        message: 'Buyer information not found. Please log in again.',
        severity: 'error',
      });
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      const endpoint = `${config.API_BASE_URL}/view_listings`;

      const response = await axios.get(endpoint);

      if (response.status === 200) {
        const listingsData = response.data.listings;
        setListings(listingsData);
        setFilteredListings(listingsData);

        // Extract unique Makes and Models
        const makes = [...new Set(listingsData.map((listing) => listing.make))];
        setAvailableMakes(makes);
        setSelectedMakes(['All']);

        const models = [...new Set(listingsData.map((listing) => listing.model))];
        setAvailableModels(models);
        setSelectedModels(['All']);

        // Determine Year Range
        const years = listingsData.map((listing) => listing.year);
        const minYear = years.length > 0 ? Math.min(...years) : 0;
        const maxYear = years.length > 0 ? Math.max(...years) : 0;
        setYearRange({ min: minYear, max: maxYear });
        setSelectedMinYear(minYear);
        setSelectedMaxYear(maxYear);

        // Determine Price Range
        const prices = listingsData.map((listing) => listing.price);
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

  // Fetch Shortlists
  const fetchShortlists = async () => {
    if (!userID) {
      setSnackbar({
        open: true,
        message: 'Buyer information not found. Please log in again.',
        severity: 'error',
      });
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      const endpoint = `${config.API_BASE_URL}/view_shortlist`;
      const response = await axios.get(endpoint, {
        params: { user_id: userID },
      });

      if (response.status === 200) {
        const shortlistedListingIDs = response.data.shortlist; // Assuming it's an array of listing IDs
        // Fetch listing details based on IDs
        const listingsResponse = await axios.post(`${config.API_BASE_URL}/get_listings_by_ids`, {
          listing_ids: shortlistedListingIDs,
        });

        if (listingsResponse.status === 200) {
          const shortlistedListingsData = listingsResponse.data.listings;
          setShortlists(shortlistedListingsData);
          setFilteredShortlists(shortlistedListingsData);
        } else {
          setSnackbar({
            open: true,
            message: 'Failed to fetch shortlisted listings.',
            severity: 'error',
          });
        }
      } else {
        setSnackbar({
          open: true,
          message: 'Failed to fetch shortlisted listings.',
          severity: 'error',
        });
      }
    } catch (error) {
      console.error('Error fetching shortlists:', error);
      setSnackbar({
        open: true,
        message: 'Failed to fetch shortlists.',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  // Initial Fetch based on currentView
  useEffect(() => {
    if (currentView === 'landing') {
      // No action needed
    } else if (currentView === 'listings') {
      fetchListings();
    } else if (currentView === 'shortlists') {
      fetchShortlists();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentView]);

  // ----------------------- Used Car Listings Functions -----------------------

  /**
   * User Story: As a buyer, I want to search for used car listings so that I can find specific cars.
   * Trigger: The buyer enters a search query and submits.
   */

  const handleSearchListings = () => {
    let filtered = [...listings];

    // Filter by Selected Makes
    if (selectedMakes.length > 0 && !selectedMakes.includes('All')) {
      filtered = filtered.filter((listing) =>
        selectedMakes.includes(listing.make)
      );
    }

    // Filter by Selected Models
    if (selectedModels.length > 0 && !selectedModels.includes('All')) {
      filtered = filtered.filter((listing) =>
        selectedModels.includes(listing.model)
      );
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
   * User Story: As a buyer, I want to reset the search to view all listings.
   * Trigger: The buyer clicks the reset search button.
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

  // ----------------------- View More Functionality -----------------------
  const handleViewMore = async (listing) => {
    try {
      // Call the track_view API to increment the view count
      await axios.post(`${config.API_BASE_URL}/track_view`, {
        listing_id: listing._id,
      });
  
      // Fetch the seller's username using the seller_id
      const sellerResponse = await axios.get(`${config.API_BASE_URL}/get_user_id`, {
        params: { userid: listing.seller_id },
      });
  
      if (sellerResponse.status === 200 && sellerResponse.data.user) {
        setSellerUsername(sellerResponse.data.user.username);
      } else {
        setSellerUsername('Unknown Seller');
      }
  
      // Set the selected listing and open the dialog
      setSelectedListing(listing);
      setOpenViewMore(true);
    } catch (error) {
      console.error('Error viewing more details:', error);
      setSnackbar({
        open: true,
        message: 'Failed to load listing details.',
        severity: 'error',
      });
    }
  };
  
  const handleShortlist = async (listing) => {
    try {
      // Call the track_shortlist API to add the listing to the user's shortlist
      const response = await axios.post(`${config.API_BASE_URL}/track_shortlist`, {
        listing_id: listing._id,
        user_id: userID, // Assuming userID is stored in state or retrieved from context
      });
  
      if (response.status === 200 && response.data.success) {
        setShortlistedListings([...shortlistedListings, listing]);
        setSnackbar({
          open: true,
          message: 'Listing shortlisted successfully.',
          severity: 'success',
        });
      } else {
        setSnackbar({
          open: true,
          message: 'Failed to shortlist the listing.',
          severity: 'error',
        });
      }
    } catch (error) {
      console.error('Error shortlisting listing:', error);
      setSnackbar({
        open: true,
        message: 'Failed to shortlist the listing.',
        severity: 'error',
      });
    }
  };
   
  // ----------------------- Render Listings -----------------------

  const renderListings = () => {
    // Calculate the slice of listings to display based on pagination
    const start = listingPage * listingRowsPerPage;
    const end = start + listingRowsPerPage;
    const paginatedListings = filteredListings.slice(start, end);

    return (
      <Box sx={{ m: 1 }}>
        {/* Search and Filters Section */}
        <Box sx={{ display: 'flex', flexDirection: 'column', mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            Search Used Car Listings
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

            {/* Year Range Filter */}
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

            {/* Price Range Filter */}
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
                  <TableCell>Price</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedListings.length > 0 ? (
                  paginatedListings.map((listing) => (
                    <TableRow key={listing._id}>
                      <TableCell>{listing.make}</TableCell>
                      <TableCell>${listing.price.toLocaleString()}</TableCell>
                      <TableCell align="center">
                        <Button
                          variant="outlined"
                          color="primary"
                          onClick={() => handleViewMore(listing)}
                          sx={{ mr: 1 }}
                        >
                          View More
                        </Button>
                        <Button
                          variant="contained"
                          color="secondary"
                          onClick={() => handleShortlist(listing)}
                          disabled={shortlistedListings.some(
                            (shortlisted) => shortlisted._id === listing._id
                          )}
                        >
                          {shortlistedListings.some(
                            (shortlisted) => shortlisted._id === listing._id
                          )
                            ? 'Shortlisted'
                            : 'Shortlist'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} align="center">
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

        {/* View More Dialog */}
        <Dialog
          open={openViewMore}
          onClose={() => setOpenViewMore(false)}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>
            Listing Details
            <IconButton
              aria-label="close"
              onClick={() => setOpenViewMore(false)}
              sx={{
                position: 'absolute',
                right: 8,
                top: 8,
                color: (theme) => theme.palette.grey[500],
              }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers>
            {selectedListing && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Typography variant="body1">
                  <strong>Make:</strong> {selectedListing.make}
                </Typography>
                <Typography variant="body1">
                  <strong>Model:</strong> {selectedListing.model}
                </Typography>
                <Typography variant="body1">
                  <strong>Year:</strong> {selectedListing.year}
                </Typography>
                <Typography variant="body1">
                  <strong>Price:</strong> ${selectedListing.price.toLocaleString()}
                </Typography>
                <Typography variant="body1">
                  <strong>Seller Name:</strong> {sellerUsername}
                </Typography>
                {/* Add more details as needed */}
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenViewMore(false)} color="primary">
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    );

  };


  const handleRemoveShortlist = async (listing) => {
    setIsShortlisting(true);
    try {
      // Call the remove_shortlist API
      const response = await axios.post(`${config.API_BASE_URL}/remove_shortlist`, {
        listing_id: listing._id,
        user_id: userID,
      });
  
      if (response.status === 200) {
        // Update the shortlistedListings state by removing the listing
        setShortlistedListings((prev) =>
          prev.filter((item) => item._id !== listing._id)
        );
        setFilteredShortlists((prev) =>
          prev.filter((item) => item._id !== listing._id)
        );
        setSnackbar({
          open: true,
          message: 'Listing removed from shortlist.',
          severity: 'success',
        });
      } else {
        setSnackbar({
          open: true,
          message: 'Failed to remove listing from shortlist.',
          severity: 'error',
        });
      }
    } catch (error) {
      console.error('Error removing listing from shortlist:', error);
      setSnackbar({
        open: true,
        message: 'Failed to remove listing from shortlist.',
        severity: 'error',
      });
    } finally {
      setIsShortlisting(false);
    }
  };

const renderShortlists = () => {
  // Calculate the slice of shortlists to display based on pagination
  const start = shortlistPage * shortlistRowsPerPage;
  const end = start + shortlistRowsPerPage;
  const paginatedShortlists = filteredShortlists.slice(start, end);

  return (
    <Box sx={{ m: 1 }}>
      {/* Header */}
      <Typography variant="h6" gutterBottom>
        Your Shortlisted Listings
      </Typography>

      {/* Shortlists Table */}
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
                <TableCell>Price</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedShortlists.length > 0 ? (
                paginatedShortlists.map((listing) => (
                  <TableRow key={listing._id}>
                    <TableCell>{listing.make}</TableCell>
                    <TableCell>${listing.price.toLocaleString()}</TableCell>
                    <TableCell align="center">
                      {/* View More Button */}
                      <Button
                        variant="outlined"
                        color="primary"
                        onClick={() => handleViewMore(listing)}
                        sx={{ mr: 1 }}
                      >
                        View More
                      </Button>
                      {/* Remove from Shortlist Button */}
                      <Button
                        variant="contained"
                        color="error"
                        onClick={() => handleRemoveShortlist(listing)}
                        disabled={isShortlisting}
                      >
                        {isShortlisting ? (
                          <CircularProgress size={24} color="inherit" />
                        ) : (
                          'Remove'
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} align="center">
                    No shortlisted listings found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* Pagination Controls */}
          <TablePagination
            component="div"
            count={filteredShortlists.length}
            page={shortlistPage}
            onPageChange={(event, newPage) => setShortlistPage(newPage)}
            rowsPerPage={shortlistRowsPerPage}
            onRowsPerPageChange={(event) => {
              setShortlistRowsPerPage(parseInt(event.target.value, 10));
              setShortlistPage(0); // Reset to first page
            }}
            rowsPerPageOptions={[5, 10, 25]}
            labelRowsPerPage="Shortlists per page:"
            sx={{ mt: 2 }}
          />
        </>
      )}

      {/* View More Dialog */}
      <Dialog
        open={openViewMore}
        onClose={() => setOpenViewMore(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          Listing Details
          <IconButton
            aria-label="close"
            onClick={() => setOpenViewMore(false)}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {selectedListing && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="body1">
                <strong>Make:</strong> {selectedListing.make}
              </Typography>
              <Typography variant="body1">
                <strong>Model:</strong> {selectedListing.model}
              </Typography>
              <Typography variant="body1">
                <strong>Year:</strong> {selectedListing.year}
              </Typography>
              <Typography variant="body1">
                <strong>Price:</strong> ${selectedListing.price.toLocaleString()}
              </Typography>
              <Typography variant="body1">
                <strong>Seller Name:</strong> {sellerUsername}
              </Typography>
              {/* Add more details as needed */}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenViewMore(false)} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
  // ----------------------- Logout Function -----------------------

  /**
   * User Story: As a buyer, I want to logout so that I can exit the system.
   * Trigger: The buyer clicks the logout button.
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

  // ----------------------- Render Landing Page -----------------------

  /**
   * User Story: As a buyer, I want to see a landing page upon login that allows me to navigate to different sections.
   * Trigger: The buyer logs into the system.
   */
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
          Welcome, {buyerInfo ? buyerInfo.username : 'Buyer'}!
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
              onClick={() => handleNavigation('shortlists')}
            >
              <CardActionArea sx={{ width: '100%', height: '100%' }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <RateReviewIcon sx={{ fontSize: 50, color: 'primary.main', mb: 2 }} />
                  <Typography variant="h6">View Shortlists</Typography>
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
            Buyer
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

            {/* Shortlists Button */}
            <ListItem disablePadding>
              <ListItemButton
                selected={currentView === 'shortlists'}
                onClick={() => handleNavigation('shortlists')}
              >
                <RateReviewIcon sx={{ marginRight: 2 }} />
                <ListItemText primary="View Shortlists" />
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
                : currentView === 'shortlists'
                ? 'Shortlists'
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
        {currentView === 'shortlists' && renderShortlists()}
      </Box>
    </Box>
  );
};

export default BuyerDashboard;
