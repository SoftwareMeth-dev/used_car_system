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
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import BlockIcon from '@mui/icons-material/Block';
import axios from 'axios';

const UserProfilesTable = ({ profiles, refreshProfiles }) => {
  const [editProfile, setEditProfile] = useState(null);
  const [suspendProfile, setSuspendProfile] = useState(null);
  const [updatedProfile, setUpdatedProfile] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleOpenEdit = (profile) => {
    setEditProfile(profile);
    setUpdatedProfile(profile);
    setError('');
    setSuccess('');
  };

  const handleCloseEdit = () => {
    setEditProfile(null);
    setUpdatedProfile({});
    setError('');
    setSuccess('');
  };

  const handleUpdateProfile = async () => {
    setError('');
    setSuccess('');
    try {
      await axios.put(`http://localhost:5000/api/user_admin/update_profile/${editProfile.role}`, updatedProfile);
      setSuccess('Profile updated successfully');
      refreshProfiles();
      handleCloseEdit();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to update profile');
    }
  };

  const handleOpenSuspend = (profile) => {
    setSuspendProfile(profile);
    setError('');
    setSuccess('');
  };

  const handleCloseSuspend = () => {
    setSuspendProfile(null);
    setError('');
    setSuccess('');
  };

  const handleSuspendProfile = async () => {
    setError('');
    setSuccess('');
    try {
      await axios.patch(`http://localhost:5000/api/user_admin/suspend_profile/${suspendProfile.role}`);
      setSuccess('Profile suspended successfully');
      refreshProfiles();
      handleCloseSuspend();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to suspend profile');
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
                  <TableCell>{profile.role}</TableCell>
                  <TableCell>{profile.rights}</TableCell>
                  <TableCell>{profile.suspended ? 'Suspended' : 'Active'}</TableCell>
                  <TableCell align="right">
                    <Tooltip title="Edit">
                      <IconButton onClick={() => handleOpenEdit(profile)}>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Suspend">
                      <IconButton onClick={() => handleOpenSuspend(profile)}>
                        <BlockIcon />
                      </IconButton>
                    </Tooltip>
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
          <TextField
            margin="dense"
            label="Rights"
            name="rights"
            fullWidth
            variant="standard"
            value={updatedProfile.rights || ''}
            onChange={(e) => setUpdatedProfile({ ...updatedProfile, rights: e.target.value })}
            helperText="Comma-separated rights, e.g., create,read,update,suspend"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEdit}>Cancel</Button>
          <Button onClick={handleUpdateProfile} variant="contained" color="primary">
            Update
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Suspend Profile Dialog */}
      <Dialog open={Boolean(suspendProfile)} onClose={handleCloseSuspend}>
        <DialogTitle>Suspend Profile</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
          <Typography>Are you sure you want to suspend profile "{suspendProfile?.role}"?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseSuspend}>Cancel</Button>
          <Button onClick={handleSuspendProfile} variant="contained" color="secondary">
            Suspend
          </Button>
        </DialogActions>
      </Dialog>
    </TableContainer>
  );
};

export default UserProfilesTable;
