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
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
} from '@mui/material';
import axios from 'axios';
import UserProfilesTable from './UserProfilesTable';

const availableRightsList = [
  'create',
  'read',
  'update',
  'delete',
  'suspend',
  // Add more rights as needed
];

const UserProfiles = () => {
  const [profiles, setProfiles] = useState([]);
  const [openCreate, setOpenCreate] = useState(false);
  const [newProfile, setNewProfile] = useState({
    role: '',
    rights: [],
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [availableRoles, setAvailableRoles] = useState([]); // For dynamic role options

  // Function to fetch profiles
  const fetchProfiles = async (query = '') => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (query) params.role = query; // Assuming search by role

      const response = await axios.get('http://localhost:5000/api/user_admin/view_profiles', { params });
      if (query) {
        if (response.data) {
          setProfiles([response.data]); // Single profile
        } else {
          setProfiles([]); // No profile found
        }
      } else {
        // Assume response.data is an array when no query is provided
        setProfiles(Array.isArray(response.data) ? response.data : [response.data]);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch profiles');
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch available roles from profiles
  const fetchAvailableRoles = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/user_admin/view_profiles');
      if (Array.isArray(response.data)) {
        const roles = response.data.map(profile => profile.role);
        setAvailableRoles(roles);
      } else if (response.data) {
        setAvailableRoles([response.data.role]);
      }
    } catch (err) {
      console.error(err);
      // Handle error silently or set a default list
    }
  };

  // Fetch profiles on component mount
  useEffect(() => {
    fetchProfiles();
    fetchAvailableRoles();
  }, []);

  // Handle input changes for search
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Handle search
  const handleSearch = () => {
    fetchProfiles(searchQuery);
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
    setError('');
    setSuccess('');
  };

  // Handle creating a new profile
  const handleCreateProfile = async () => {
    setError('');
    setSuccess('');
    try {
      // Basic validation
      if (!newProfile.role || newProfile.rights.length === 0) {
        setError('All fields are required');
        return;
      }

      const profileData = {
        role: newProfile.role,
        rights: newProfile.rights,
        suspended: false, // Default to active
      };

      await axios.post('http://localhost:5000/api/user_admin/create_profile', profileData);
      setSuccess('Profile created successfully');
      fetchProfiles(); // Refresh the profile list
      fetchAvailableRoles(); // Refresh roles
      handleCloseCreate();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to create profile');
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        User Profiles
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 2 }}>
        {/* Search Section */}
        <FormControl variant="outlined" size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Role</InputLabel>
          <Select
            label="Role"
            value={searchQuery}
            onChange={handleSearchChange}
            name="searchRole"
          >
            <MenuItem value="">
              <em>All</em>
            </MenuItem>
            {availableRoles.map((role, index) => (
              <MenuItem key={index} value={role}>{role.charAt(0).toUpperCase() + role.slice(1)}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button variant="contained" color="primary" onClick={handleSearch}>
          Search
        </Button>
        <Button variant="outlined" color="secondary" onClick={() => { setSearchQuery(''); fetchProfiles(); }}>
          Clear Search
        </Button>
        <Button variant="contained" color="success" onClick={handleOpenCreate}>
          Create Profile
        </Button>
      </Box>
      {/* Display error or success messages */}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      {/* Display loading indicator or profiles table */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <UserProfilesTable profiles={profiles} refreshProfiles={fetchProfiles} />
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
          <Button onClick={handleCreateProfile} variant="contained" color="primary">
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserProfiles;
