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

const BuyerDashboard = () => {
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

  // Dynamic Filters for shortlist
  const [slAvailableMakes, slSetAvailableMakes] = useState([]);
  const [slSelectedMakes, slSetSelectedMakes] = useState([]);

  const [slAvailableModels, slSetAvailableModels] = useState([]);
  const [slSelectedModels, slSetSelectedModels] = useState([]);

  const [slYearRange, slSetYearRange] = useState([0, 0]);
  const [slSelectedYearRange, slSetSelectedYearRange] = useState([0, 0]);

  const [slPriceRange, slSetPriceRange] = useState([0, 0]);
  const [slSelectedPriceRange, slSetSelectedPriceRange] = useState([0, 0]);

  const [slListingPage, slSetListingPage] = useState(0);
  const [slListingRowsPerPage, slSetListingRowsPerPage] = useState(5);

  // States for Shortlists
  const [shortlists, setShortlists] = useState([]);
  const [tempShortlists, setTempShortlists] = useState([]);
  const [fullListings, setFullListings] = useState([]);
  const [filteredShortlists, setFilteredShortlists] = useState([]);
  const [shortlistPage, setShortlistPage] = useState(0);
  const [shortlistRowsPerPage, setShortlistRowsPerPage] = useState(5);

  // States for Dialogs
  const [listingErrors, setListingErrors] = useState({});

  // States for Sellers
  const [sellers, setSellers] = useState([]); // List of sellers
  const [selectedSellerUsername, setSelectedSellerUsername] = useState(''); // Selected seller's username


  const titleMap = {
    landing: 'Buyer Dashboard',
    listings: 'Buyer Dashboard - Listings',
    shortlists: 'Buyer Dashboard - Shortlists', 
  };
  // Set the document title based on currentView
  useEffect(() => {
    const title = titleMap[currentView] || 'Buyer Dashboard';
    document.title = title;
  }, [currentView]);



  // Retrieve Agent Information from localStorage
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
        const listings = response.data.listings;
        setListings(listings);
        setFilteredListings(listings);

        // Determine Year Range
        const years = listings.map((listing) => listing.year);
        const minYear = years.length > 0 ? Math.min(...years) : 0;
        const maxYear = years.length > 0 ? Math.max(...years) : 0;
        setYearRange([minYear, maxYear]);
        setSelectedYearRange([minYear, maxYear]);

        // Determine Price Range
        const prices = listings.map((listing) => listing.price);
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

  // Fetch Shortlists
  const fetchShortlists = async () => {
    setLoading(true);
    try {
      const shortlistedListingIDs = await axios.get(`${config.API_BASE_URL}/view_shortlist`, {
        params: { user_id: username }, 
      });

      if (shortlistedListingIDs.status === 200) {
        setTempShortlists(shortlistedListingIDs.data.shortlist);
        const tempListings = await axios.get(`${config.API_BASE_URL}/view_listings`);
        if (tempListings.status === 200) {
          setFullListings(tempListings.data.listings);
          const shortlistedListings = fullListings.filter(listing => tempShortlists.includes(listing._id));
          setShortlists(shortlistedListings);
          setFilteredShortlists(shortlistedListings);
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Initial Fetch
  useEffect(() => {
    if (currentView === 'listings') {
      fetchListings();
    } else if (currentView === 'shortlists') {
      fetchShortlists();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentView]);

  // ----------------------- Used Car Listings Functions -----------------------

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
                      <TableCell align="center">
                        <Button
                          variant="contained"
                          color="info"
                          startIcon={<AddIcon />}
                          onClick={() => {
                            // dummy method
                          }}
                        >
                          Shortlist
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

 // todo 
// US #15
const renderShortlists = () => {
  // Calculate the slice of listings to display based on pagination
  const start = shortlistPage * shortlistRowsPerPage;
  const end = start + shortlistRowsPerPage;
  const paginatedShortlists = filteredShortlists.slice(start, end);

  return (
    <Box sx={{ m:1 }}>
      {/* Search and Filters Section */}
      <Box sx={{ display: 'flex', flexDirection: 'column', mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          Search Shortlists
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
                slSetSelectedMakes(makes);
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
                slSetSelectedModels(models);
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
              onChange={(e) => slSetSelectedYearRange([Number(e.target.value), selectedYearRange[1]])}
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
              onChange={(e) => slSetSelectedYearRange([selectedYearRange[0], Number(e.target.value)])}
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
              onChange={(e) => slSetSelectedPriceRange([Number(e.target.value), selectedPriceRange[1]])}
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
              onChange={(e) => slSetSelectedPriceRange([selectedPriceRange[0], Number(e.target.value)])}
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
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedShortlists.length > 0 ? (
                paginatedShortlists.map((listing) => (
                  <TableRow key={listing._id}>
                    <TableCell>{listing.make}</TableCell>
                    <TableCell>{listing.model}</TableCell>
                    <TableCell>{listing.year}</TableCell>
                    <TableCell>${listing.price.toLocaleString()}</TableCell>
                    <TableCell align="center">
                      <Button
                        variant="contained"
                        color="info"
                        startIcon={<AddIcon />}
                        onClick={() => {
                          // dummy method
                        }}
                      >
                        Shortlist
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
    </Box>
)  };

  // ----------------------- Logout Function -----------------------

  /**
   * User Story: As a used car agent, I want to logout so that I can exit the system.
   * Trigger: The agent clicks the logout button.
   */

  // US #28
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

            {/* Reviews Button */}
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
                ? 'Reviews'
                : 'Dashboard'}
            </Typography>
            {/* US #28 */}
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
