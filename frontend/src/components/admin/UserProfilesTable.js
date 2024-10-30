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
  TextField,
  Alert,
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

const availableRightsList = [
  'create',
  'read',
  'update',
  'delete',
  'suspend',
  // Add more rights as needed
];

const UserProfilesTable = ({ profiles, refreshProfiles }) => {
  const [editProfile, setEditProfile] = useState(null);
  const [suspendProfile, setSuspendProfile] = useState(null);
  const [reenableProfile, setReenableProfile] = useState(null); // State for re-enabling profile
  const [updatedProfile, setUpdatedProfile] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [availableRights, setAvailableRights] = useState(availableRightsList); // Available rights for selection

  // Open edit dialog
  const handleOpenEdit = (profile) => {
    setEditProfile(profile);
    setUpdatedProfile({
      rights: profile.rights || [],
      // Add other fields as necessary
    });
    setError('');
    setSuccess('');
  };

  // Close edit dialog
  const handleCloseEdit = () => {
    setEditProfile(null);
    setUpdatedProfile({});
    setError('');
    setSuccess('');
  };

  // Handle updating profile
  const handleUpdateProfile = async () => {
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      // Basic validation
      if (updatedProfile.rights.length === 0) {
        setError('At least one right is required');
        setLoading(false);
        return;
      }

      await axios.put(`http://localhost:5000/api/user_admin/update_profile/${editProfile.role}`, updatedProfile);
      setSuccess('Profile updated successfully');
      refreshProfiles();
      handleCloseEdit();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  // Open suspend dialog
  const handleOpenSuspend = (profile) => {
    setSuspendProfile(profile);
    setError('');
    setSuccess('');
  };

  // Close suspend dialog
  const handleCloseSuspend = () => {
    setSuspendProfile(null);
    setError('');
    setSuccess('');
  };

  // Handle suspending profile
  const handleSuspendProfile = async () => {
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await axios.patch(`http://localhost:5000/api/user_admin/suspend_profile/${suspendProfile.role}`);
      setSuccess('Profile and associated users suspended successfully');
      refreshProfiles();
      handleCloseSuspend();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to suspend profile');
    } finally {
      setLoading(false);
    }
  };

  // Open re-enable dialog
  const handleOpenReenable = (profile) => {
    setReenableProfile(profile);
    setError('');
    setSuccess('');
  };

  // Close re-enable dialog
  const handleCloseReenable = () => {
    setReenableProfile(null);
    setError('');
    setSuccess('');
  };

  // Handle re-enabling profile
  const handleReenableProfile = async () => {
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await axios.patch(`http://localhost:5000/api/user_admin/reenable_profile/${reenableProfile.role}`);
      setSuccess('Profile and associated users re-enabled successfully');
      refreshProfiles();
      handleCloseReenable();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to re-enable profile');
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
                  <TableCell>{profile.rights.join(', ')}</TableCell>
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
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
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
              {availableRightsList.map((right, index) => (
                <MenuItem key={index} value={right}>
                  {right.charAt(0).toUpperCase() + right.slice(1)}
                </MenuItem>
              ))}
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
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
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
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
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
