// src/components/admin/UserProfilesTable.js
import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  CircularProgress,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import BlockIcon from '@mui/icons-material/Block';
import RestoreIcon from '@mui/icons-material/Restore'; // Icon for Re-enable
import axios from 'axios';
import config from '../../config';
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
const UserProfilesTable = ({ profiles, refreshProfiles, setSnackbar }) => {
  const [editProfile, setEditProfile] = useState(null);
  const [suspendProfile, setSuspendProfile] = useState(null);
  const [reenableProfile, setReenableProfile] = useState(null); // State for re-enabling profile
  const [updatedProfile, setUpdatedProfile] = useState({});
  const [loading, setLoading] = useState(false);
  const [availableRights, setAvailableRights] = useState([]); // Available rights for selection

  // Function to fetch available rights from profiles (if dynamic)
  const fetchAvailableRights = async () => {
    try {
      const response = await axios.get(`${config.API_BASE_URL}/user_admin/view_profiles`);
      if (Array.isArray(response.data)) {
        const rights = response.data.flatMap(profile => profile.rights);
        setAvailableRights([...new Set(rights)]); // Remove duplicates
      } else if (response.data) {
        setAvailableRights(response.data.rights || []);
      }
    } catch (err) {
      console.error(err);
      setAvailableRights(availableRightsList); // Default rights
      setSnackbar({
        open: true,
        message: 'Failed to fetch available rights. Using default rights.',
        severity: 'warning',
      });
    }
  };

  // Open edit dialog
  const handleOpenEdit = (profile) => {
    setEditProfile(profile);
    setUpdatedProfile({
      rights: profile.rights || [],
      // Add other fields as necessary
    });
    fetchAvailableRights(); // Fetch rights when editing
  };

  // Close edit dialog
  const handleCloseEdit = () => {
    setEditProfile(null);
    setUpdatedProfile({});
  };

  // Handle updating profile
  const handleUpdateProfile = async () => {
    if (!updatedProfile.rights || updatedProfile.rights.length === 0) {
      setSnackbar({
        open: true,
        message: 'At least one right is required.',
        severity: 'error',
      });
      return;
    }

    setLoading(true);
    try {
      await axios.put(`${config.API_BASE_URL}/user_admin/update_profile/${editProfile.role}`, updatedProfile);
      setSnackbar({
        open: true,
        message: 'Profile updated successfully.',
        severity: 'success',
      });
      refreshProfiles();
      handleCloseEdit();
    } catch (err) {
      console.error(err);
      if (err.response && err.response.status === 404) {
        setSnackbar({
          open: true,
          message: 'Profile not found.',
          severity: 'error',
        });
      } else {
        setSnackbar({
          open: true,
          message: 'Failed to update profile.',
          severity: 'error',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Open suspend dialog
  const handleOpenSuspend = (profile) => {
    setSuspendProfile(profile);
  };

  // Close suspend dialog
  const handleCloseSuspend = () => {
    setSuspendProfile(null);
  };

  // Handle suspending profile
  const handleSuspendProfile = async () => {
    setLoading(true);
    try {
      await axios.patch(`${config.API_BASE_URL}/user_admin/suspend_profile/${suspendProfile.role}`);
      setSnackbar({
        open: true,
        message: `Profile "${suspendProfile.role}" suspended successfully.`,
        severity: 'success',
      });
      refreshProfiles();
      handleCloseSuspend();
    } catch (err) {
      console.error(err);
      if (err.response && err.response.status === 404) {
        setSnackbar({
          open: true,
          message: 'Profile not found.',
          severity: 'error',
        });
      } else {
        setSnackbar({
          open: true,
          message: 'Failed to suspend profile.',
          severity: 'error',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Open re-enable dialog
  const handleOpenReenable = (profile) => {
    setReenableProfile(profile);
  };

  // Close re-enable dialog
  const handleCloseReenable = () => {
    setReenableProfile(null);
  };

  // Handle re-enabling profile
  const handleReenableProfile = async () => {
    setLoading(true);
    try {
      await axios.patch(`${config.API_BASE_URL}/user_admin/reenable_profile/${reenableProfile.role}`);
      setSnackbar({
        open: true,
        message: `Profile "${reenableProfile.role}" re-enabled successfully.`,
        severity: 'success',
      });
      refreshProfiles();
      handleCloseReenable();
    } catch (err) {
      console.error(err);
      if (err.response && err.response.status === 404) {
        setSnackbar({
          open: true,
          message: 'Profile not found.',
          severity: 'error',
        });
      } else {
        setSnackbar({
          open: true,
          message: 'Failed to re-enable profile.',
          severity: 'error',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <TableContainer component={Paper}>
      <Table aria-label="user profiles table">
        <TableHead>
          <TableRow>
            <TableCell>Role</TableCell>
            <TableCell>Rights</TableCell>
            <TableCell>Status</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {profiles.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} align="center">
                <Typography>No profiles found.</Typography>
              </TableCell>
            </TableRow>
          ) : (
            profiles.map((profile, index) => (
              profile ? ( // Ensure profile is not null
                <TableRow key={index}>
                  <TableCell>{profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}</TableCell>
                  <TableCell>
                    {Array.isArray(profile.rights) && profile.rights.length > 0
                      ? profile.rights.join(', ')
                      : 'No rights assigned'}
                  </TableCell>
                  <TableCell>{profile.suspended ? 'Suspended' : 'Active'}</TableCell>
                  <TableCell align="right">
                    {/* Edit Icon */}
                    <Tooltip title="Edit">
                      <IconButton onClick={() => handleOpenEdit(profile)}>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    {/* Suspend or Re-enable Icon based on profile status */}
                    {profile.suspended ? (
                      <Tooltip title="Re-enable">
                        <IconButton onClick={() => handleOpenReenable(profile)}>
                          <RestoreIcon />
                        </IconButton>
                      </Tooltip>
                    ) : (
                      <Tooltip title="Suspend">
                        <IconButton onClick={() => handleOpenSuspend(profile)}>
                          <BlockIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                <TableRow key={index}>
                  <TableCell colSpan={4} align="center">
                    <Typography>Invalid profile data.</Typography>
                  </TableCell>
                </TableRow>
              )
            ))
          )}
        </TableBody>
      </Table>
      
      {/* Edit Profile Dialog */}
      <Dialog open={Boolean(editProfile)} onClose={handleCloseEdit}>
        <DialogTitle>Edit Profile</DialogTitle>
        <DialogContent>
          <Typography variant="subtitle1" gutterBottom>
            Role: {editProfile?.role.charAt(0).toUpperCase() + editProfile?.role.slice(1)}
          </Typography>
          <FormControl fullWidth variant="standard" margin="dense">
            <InputLabel>Rights</InputLabel>
            <Select
              label="Rights"
              name="rights"
              multiple
              value={updatedProfile.rights || []}
              onChange={(e) => setUpdatedProfile({ ...updatedProfile, rights: e.target.value })}
              renderValue={(selected) => selected.join(', ')}
            >
              {availableRights.length > 0
                ? availableRights.map((right, index) => (
                    <MenuItem key={index} value={right}>
                      {right.charAt(0).toUpperCase() + right.slice(1)}
                    </MenuItem>
                  ))
                : availableRightsList.map((right, index) => (
                    <MenuItem key={index} value={right}>
                      {right.charAt(0).toUpperCase() + right.slice(1)}
                    </MenuItem>
                  ))
              }
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEdit}>Cancel</Button>
          <Button onClick={handleUpdateProfile} variant="contained" color="primary" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Update'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Suspend Profile Dialog */}
      <Dialog open={Boolean(suspendProfile)} onClose={handleCloseSuspend}>
        <DialogTitle>Suspend Profile</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to suspend profile "{suspendProfile?.role}" and all associated users?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseSuspend}>Cancel</Button>
          <Button onClick={handleSuspendProfile} variant="contained" color="secondary" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Suspend'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Re-enable Profile Dialog */}
      <Dialog open={Boolean(reenableProfile)} onClose={handleCloseReenable}>
        <DialogTitle>Re-enable Profile</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to re-enable profile "{reenableProfile?.role}" and all associated users?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseReenable}>Cancel</Button>
          <Button onClick={handleReenableProfile} variant="contained" color="primary" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Re-enable'}
          </Button>
        </DialogActions>
      </Dialog>
    </TableContainer>
  );
};

export default UserProfilesTable;
