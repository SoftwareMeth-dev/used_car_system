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
  Typography,
  CircularProgress,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Snackbar,
  Alert as MuiAlert,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import BlockIcon from '@mui/icons-material/Block';
import RestoreIcon from '@mui/icons-material/Restore'; // Icon for Re-enable
import axios from 'axios';
import config from '../../config';

const MuiAlertComponent = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const UserAccountsTable = ({ users, refreshUsers, setSnackbar }) => {
  const [editUser, setEditUser] = useState(null);
  const [suspendUser, setSuspendUser] = useState(null);
  const [reenableUser, setReenableUser] = useState(null); // State for re-enabling user
  const [updatedUser, setUpdatedUser] = useState({});
  const [loading, setLoading] = useState(false);
  const [availableRoles, setAvailableRoles] = useState([]); // To dynamically fetch roles for editing
  const [snackbarLocal, setSnackbarLocal] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

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
      setSnackbarLocal({
        open: true,
        message: 'Failed to fetch available roles. Using default roles.',
        severity: 'warning',
      });
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
  };

  // Close edit dialog
  const handleCloseEdit = () => {
    setEditUser(null);
    setUpdatedUser({});
  };

  // Handle updating user
  const handleUpdateUser = async () => {
    if (!updatedUser.email || !updatedUser.role) {
      setSnackbarLocal({
        open: true,
        message: 'Email and Role are required.',
        severity: 'error',
      });
      return;
    }

    setLoading(true);
    try {
      await axios.put(`${config.API_BASE_URL}/user_admin/update_user/${editUser.username}`, updatedUser);
      setSnackbarLocal({
        open: true,
        message: 'User updated successfully.',
        severity: 'success',
      });
      refreshUsers();
      handleCloseEdit();
    } catch (err) {
      console.error(err);
      if (err.response && err.response.status === 404) {
        setSnackbarLocal({
          open: true,
          message: 'User not found.',
          severity: 'error',
        });
      } else {
        setSnackbarLocal({
          open: true,
          message: 'Failed to update user.',
          severity: 'error',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Open suspend dialog
  const handleOpenSuspend = (user) => {
    setSuspendUser(user);
  };

  // Close suspend dialog
  const handleCloseSuspend = () => {
    setSuspendUser(null);
  };

  // Handle suspending user
  const handleSuspendUser = async () => {
    setLoading(true);
    try {
      await axios.patch(`${config.API_BASE_URL}/user_admin/suspend_user/${suspendUser.username}`);
      setSnackbarLocal({
        open: true,
        message: `User "${suspendUser.username}" suspended successfully.`,
        severity: 'success',
      });
      refreshUsers();
      handleCloseSuspend();
    } catch (err) {
      console.error(err);
      if (err.response && err.response.status === 404) {
        setSnackbarLocal({
          open: true,
          message: 'User not found.',
          severity: 'error',
        });
      } else {
        setSnackbarLocal({
          open: true,
          message: 'Failed to suspend user.',
          severity: 'error',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Open re-enable dialog
  const handleOpenReenable = (user) => {
    setReenableUser(user);
  };

  // Close re-enable dialog
  const handleCloseReenable = () => {
    setReenableUser(null);
  };

  // Handle re-enabling user
  const handleReenableUser = async () => {
    setLoading(true);
    try {
      await axios.patch(`${config.API_BASE_URL}/user_admin/reenable_user/${reenableUser.username}`);
      setSnackbarLocal({
        open: true,
        message: `User "${reenableUser.username}" re-enabled successfully.`,
        severity: 'success',
      });
      refreshUsers();
      handleCloseReenable();
    } catch (err) {
      console.error(err);
      if (err.response && err.response.status === 404) {
        setSnackbarLocal({
          open: true,
          message: 'User not found.',
          severity: 'error',
        });
      } else {
        setSnackbarLocal({
          open: true,
          message: 'Failed to re-enable user.',
          severity: 'error',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle closing the local Snackbar
  const handleCloseSnackbarLocal = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarLocal({ ...snackbarLocal, open: false });
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
                  <TableCell>{user.username || 'N/A'}</TableCell>
                  <TableCell>{user.email || 'N/A'}</TableCell>
                  <TableCell>
                    {user.role
                      ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
                      : 'No Role'}
                  </TableCell>
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
                <MenuItem key={idx} value={role}>
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </MenuItem>
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
          <Typography>Are you sure you want to re-enable user "{reenableUser?.username}"?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseReenable}>Cancel</Button>
          <Button onClick={handleReenableUser} variant="contained" color="primary" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Re-enable'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Local Snackbar for UserAccountsTable operations */}
      <Snackbar
        open={snackbarLocal.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbarLocal}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <MuiAlertComponent onClose={handleCloseSnackbarLocal} severity={snackbarLocal.severity} sx={{ width: '100%' }}>
          {snackbarLocal.message}
        </MuiAlertComponent>
      </Snackbar>
    </TableContainer>
  );
};

export default UserAccountsTable;
