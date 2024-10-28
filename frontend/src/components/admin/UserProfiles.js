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
} from '@mui/material';
import axios from 'axios';
import UserProfilesTable from './UserProfilesTable';
import SearchBar from '../common/SearchBar';


const UserProfiles = () => {
  const [profiles, setProfiles] = useState([]);
  const [openCreate, setOpenCreate] = useState(false);
  const [newProfile, setNewProfile] = useState({
    role: '',
    rights: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  const fetchProfiles = async (query = '') => {
    try {
      const response = await axios.get(`http://localhost:5000/api/user_admin/view_profiles`, {
        params: { role: query },
      });
      setProfiles([response.data]); // Assuming `view_profiles` returns a single profile based on role
    } catch (err) {
      console.error(err);
      setError('Failed to fetch profiles');
    }
  };
  
  useEffect(() => {
    fetchProfiles();
  }, []);
  
  const handleOpenCreate = () => {
    setOpenCreate(true);
  };
  
  const handleCloseCreate = () => {
    setOpenCreate(false);
    setNewProfile({
      role: '',
      rights: '',
    });
    setError('');
    setSuccess('');
  };
  
  const handleCreateProfile = async () => {
    setError('');
    setSuccess('');
    try {
      await axios.post('http://localhost:5000/api/user_admin/create_profile', newProfile);
      setSuccess('Profile created successfully');
      fetchProfiles(); // Refresh the profile list
      handleCloseCreate();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to create profile');
    }
  };
  
  const handleSearch = () => {
    fetchProfiles(searchQuery);
  };
  
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        User Profiles
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <SearchBar
          placeholder="Search by role"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onSearch={handleSearch}
        />
        <Button variant="contained" color="primary" onClick={handleOpenCreate}>
          Create Profile
        </Button>
      </Box>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      <UserProfilesTable profiles={profiles} refreshProfiles={fetchProfiles} />
      
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
          <TextField
            margin="dense"
            label="Rights"
            name="rights"
            fullWidth
            variant="standard"
            value={newProfile.rights}
            onChange={(e) => setNewProfile({ ...newProfile, rights: e.target.value })}
            helperText="Comma-separated rights, e.g., create,read,update,suspend"
          />
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
