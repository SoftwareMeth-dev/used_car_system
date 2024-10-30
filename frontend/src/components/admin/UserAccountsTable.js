// src/components/admin/UserAccountsTable.js
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

const UserAccountsTable = ({ users, refreshUsers }) => {
  const [editUser, setEditUser] = useState(null);
  const [suspendUser, setSuspendUser] = useState(null);
  const [reenableUser, setReenableUser] = useState(null); // State for re-enabling user
  const [updatedUser, setUpdatedUser] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [availableRoles, setAvailableRoles] = useState([]); // To dynamically fetch roles for editing

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

  // Open edit dialog
  const handleOpenEdit = (user) => {
    setEditUser(user);
    setUpdatedUser({
      email: user.email || '',
      role: user.role || '',
      // Add other fields as necessary
    });
    setError('');
    setSuccess('');
    fetchAvailableRoles(); // Fetch roles when editing
  };

  // Close edit dialog
  const handleCloseEdit = () => {
    setEditUser(null);
    setUpdatedUser({});
    setError('');
    setSuccess('');
  };

  // Handle updating user
  const handleUpdateUser = async () => {
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      // Basic validation
      if (!updatedUser.email || !updatedUser.role) {
        setError('Email and Role are required');
        setLoading(false);
        return;
      }

      await axios.put(`http://localhost:5000/api/user_admin/update_user/${editUser.username}`, updatedUser);
      setSuccess('User updated successfully');
      refreshUsers();
      handleCloseEdit();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to update user');
    } finally {
      setLoading(false);
    }
  };

  // Open suspend dialog
  const handleOpenSuspend = (user) => {
    setSuspendUser(user);
    setError('');
    setSuccess('');
  };

  // Close suspend dialog
  const handleCloseSuspend = () => {
    setSuspendUser(null);
    setError('');
    setSuccess('');
  };

  // Handle suspending user
  const handleSuspendUser = async () => {
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await axios.patch(`http://localhost:5000/api/user_admin/suspend_user/${suspendUser.username}`);
      setSuccess('User suspended successfully');
      refreshUsers();
      handleCloseSuspend();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to suspend user');
    } finally {
      setLoading(false);
    }
  };

  // Open re-enable dialog
  const handleOpenReenable = (user) => {
    setReenableUser(user);
    setError('');
    setSuccess('');
  };

  // Close re-enable dialog
  const handleCloseReenable = () => {
    setReenableUser(null);
    setError('');
    setSuccess('');
  };

  // Handle re-enabling user
  const handleReenableUser = async () => {
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await axios.patch(`http://localhost:5000/api/user_admin/reenable_user/${reenableUser.username}`);
      setSuccess('User re-enabled successfully');
      refreshUsers();
      handleCloseReenable();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to re-enable user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <TableContainer component={Paper}>
      <Table aria-label="user accounts table">
        <TableHead>
          <TableRow>
            <TableCell>Username</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Role</TableCell>
            <TableCell>Status</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} align="center">
                <Typography>No users found.</Typography>
              </TableCell>
            </TableRow>
          ) : (
            users.map((user, index) => (
              user ? ( // Ensure user is not null
                <TableRow key={index}>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</TableCell>
                  <TableCell>{user.suspended ? 'Suspended' : 'Active'}</TableCell>
                  <TableCell align="right">
                    {/* Edit Icon */}
                    <Tooltip title="Edit">
                      <IconButton onClick={() => handleOpenEdit(user)}>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    {/* Suspend or Re-enable Icon based on user status */}
                    {user.suspended ? (
                      <Tooltip title="Re-enable">
                        <IconButton onClick={() => handleOpenReenable(user)}>
                          <RestoreIcon />
                        </IconButton>
                      </Tooltip>
                    ) : (
                      <Tooltip title="Suspend">
                        <IconButton onClick={() => handleOpenSuspend(user)}>
                          <BlockIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                <TableRow key={index}>
                  <TableCell colSpan={5} align="center">
                    <Typography>Invalid user data.</Typography>
                  </TableCell>
                </TableRow>
              )
            ))
          )}
        </TableBody>
      </Table>

      {/* Edit User Dialog */}
      <Dialog open={Boolean(editUser)} onClose={handleCloseEdit}>
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
          <TextField
            margin="dense"
            label="Email"
            name="email"
            fullWidth
            variant="standard"
            value={updatedUser.email || ''}
            onChange={(e) => setUpdatedUser({ ...updatedUser, email: e.target.value })}
          />
          <FormControl fullWidth variant="standard" margin="dense">
            <InputLabel>Role</InputLabel>
            <Select
              label="Role"
              name="role"
              value={updatedUser.role || ''}
              onChange={(e) => setUpdatedUser({ ...updatedUser, role: e.target.value })}
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {availableRoles.map((role, idx) => (
                <MenuItem key={idx} value={role}>{role.charAt(0).toUpperCase() + role.slice(1)}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEdit}>Cancel</Button>
          <Button onClick={handleUpdateUser} variant="contained" color="primary" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Update'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Suspend User Dialog */}
      <Dialog open={Boolean(suspendUser)} onClose={handleCloseSuspend}>
        <DialogTitle>Suspend User</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
          <Typography>Are you sure you want to suspend user "{suspendUser?.username}"?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseSuspend}>Cancel</Button>
          <Button onClick={handleSuspendUser} variant="contained" color="secondary" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Suspend'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Re-enable User Dialog */}
      <Dialog open={Boolean(reenableUser)} onClose={handleCloseReenable}>
        <DialogTitle>Re-enable User</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
          <Typography>Are you sure you want to re-enable user "{reenableUser?.username}"?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseReenable}>Cancel</Button>
          <Button onClick={handleReenableUser} variant="contained" color="primary" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Re-enable'}
          </Button>
        </DialogActions>
      </Dialog>
    </TableContainer>
  );
};

export default UserAccountsTable;
