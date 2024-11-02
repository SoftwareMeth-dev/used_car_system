// src/components/admin/UserProfiles.js
import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Snackbar, // Import Snackbar
  Alert as MuiAlert, // Import Alert for Snackbar
} from '@mui/material';
import axios from 'axios';
import UserProfilesTable from './UserProfilesTable';
import config from '../../config';

const MuiAlertComponent = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const availableRightsList = ["track_views",
"track_shortlists",
"rate_review_agents",
"search_cars",
"view_listings",
"save_shortlist",
"search_shortlist",
"view_shortlist",
"use_loan_calculator",
"create_listing",
"view_listing",
"update_listing",
"delete_listing",
"search_listing",
"create_user",
"view_user",
"update_user",
"suspend_user", 
"search_user", 
"manage_profiles", 
];

const UserProfiles = () => {
  const [profiles, setProfiles] = useState([]);
  const [openCreate, setOpenCreate] = useState(false);
  const [newProfile, setNewProfile] = useState({
    role: '',
    rights: [],
  });
  const [filters, setFilters] = useState({
    role: '',
  });
  const [loading, setLoading] = useState(false);
  const [availableRoles, setAvailableRoles] = useState([]); // For dynamic role options
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success', // 'success' | 'error' | 'warning' | 'info'
  });

  // Handler to close the Snackbar
  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  // Function to fetch available roles from profiles
  const fetchAvailableRoles = async () => {
    try {
      const response = await axios.get(`${config.API_BASE_URL}/user_admin/view_profiles`);
      if (Array.isArray(response.data)) {
        const roles = response.data.map(profile => profile.role);
        setAvailableRoles(roles);
      } else if (response.data) {
        setAvailableRoles([response.data.role]);
      }
    } catch (err) {
      console.error(err);
      // Optionally set a default list or notify the user
      setAvailableRoles(['admin', 'user']); // Example default roles
      setSnackbar({
        open: true,
        message: 'Failed to fetch available roles. Using default roles.',
        severity: 'warning',
      });
    }
  };

  // Function to fetch profiles based on filters
  const fetchProfiles = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.role) params.role = filters.role;

      const response = await axios.get(`${config.API_BASE_URL}/user_admin/view_profiles`, { params });
      if (filters.role) {
        if (response.data) {
          setProfiles([response.data]); // Single profile
        } else {
          setProfiles([]); // No profile found
        }
      } else {
        // Assume response.data is an array when no filter is applied
        setProfiles(Array.isArray(response.data) ? response.data : [response.data]);
      }
    } catch (err) {
      console.error(err);
      setSnackbar({
        open: true,
        message: 'Failed to fetch profiles.',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch profiles and available roles on component mount
  useEffect(() => {
    fetchAvailableRoles();
    fetchProfiles();
    // eslint-disable-next-line
  }, []);

  // Handle input changes for filters
  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  // Apply filters
  const handleApplyFilters = () => {
    fetchProfiles();
  };

  // Clear all filters
  const handleClearFilters = () => {
    setFilters({
      role: '',
    });
    fetchProfiles();
  };

  // Open create profile dialog
  const handleOpenCreate = () => {
    setOpenCreate(true);
  };

  // Close create profile dialog
  const handleCloseCreate = () => {
    setOpenCreate(false);
    setNewProfile({
      role: '',
      rights: [],
    });
  };

  // Handle creating a new profile
  const handleCreateProfile = async () => {
    // Basic validation
    if (!newProfile.role.trim()) {
      setSnackbar({
        open: true,
        message: 'Role is required.',
        severity: 'error',
      });
      return;
    }
    if (newProfile.rights.length === 0) {
      setSnackbar({
        open: true,
        message: 'At least one right is required.',
        severity: 'error',
      });
      return;
    }

    setLoading(true);
    try {
      const profileData = {
        role: newProfile.role.trim(),
        rights: newProfile.rights,
        suspended: false, // Default to active
      };

      const response = await axios.post(`${config.API_BASE_URL}/user_admin/create_profile`, profileData);

      if (response.status === 200 || response.status === 201) {
        setSnackbar({
          open: true,
          message: 'Profile created successfully.',
          severity: 'success',
        });
        fetchProfiles(); // Refresh the profile list
        handleCloseCreate();
      } else {
        setSnackbar({
          open: true,
          message: 'Failed to create profile.',
          severity: 'error',
        });
      }
    } catch (err) {
      console.error(err);
      if (err.response && err.response.status === 400) {
        setSnackbar({
          open: true,
          message: 'Profile already exists or invalid data provided.',
          severity: 'error',
        });
      } else {
        setSnackbar({
          open: true,
          message: 'Failed to create profile.',
          severity: 'error',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        User Profiles
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 2 }}>
        {/* Filter Section */}
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <FormControl variant="outlined" size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Role</InputLabel>
            <Select
              label="Role"
              name="role"
              value={filters.role}
              onChange={handleFilterChange}
            >
              <MenuItem value="">
                <em>All</em>
              </MenuItem>
              {availableRoles.map((role, index) => (
                <MenuItem key={index} value={role}>
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="contained" color="primary" onClick={handleApplyFilters}>
            Apply Filters
          </Button>
          <Button variant="outlined" color="secondary" onClick={handleClearFilters}>
            Clear Filters
          </Button>
        </Box>
        <Box sx={{ alignSelf: 'flex-end' }}>
          <Button variant="contained" color="success" onClick={handleOpenCreate}>
            Create Profile
          </Button>
        </Box>
      </Box>
      {/* Display loading indicator or profiles table */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <UserProfilesTable profiles={profiles} refreshProfiles={fetchProfiles} setSnackbar={setSnackbar} />
      )}

      {/* Create Profile Dialog */}
      <Dialog open={openCreate} onClose={handleCloseCreate}>
        <DialogTitle>Create New Profile</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Role"
            name="role"
            fullWidth
            variant="standard"
            value={newProfile.role}
            onChange={(e) => setNewProfile({ ...newProfile, role: e.target.value })}
          />
          <FormControl fullWidth variant="standard" margin="dense">
            <InputLabel>Rights</InputLabel>
            <Select
              label="Rights"
              name="rights"
              multiple
              value={newProfile.rights}
              onChange={(e) => setNewProfile({ ...newProfile, rights: e.target.value })}
              renderValue={(selected) => selected.join(', ')}
            >
              {availableRightsList.map((right, index) => (
                <MenuItem key={index} value={right}>
                  {right.charAt(0).toUpperCase() + right.slice(1)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCreate}>Cancel</Button>
          <Button onClick={handleCreateProfile} variant="contained" color="primary" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for global success and error messages */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <MuiAlertComponent onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </MuiAlertComponent>
      </Snackbar>
    </Box>
  );  
};

export default UserProfiles;
