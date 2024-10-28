// Ensure there's no reference to UserAccounts within UserAccountsTable.js
// The component should only handle displaying the table and related dialogs

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
  Typography, // Ensure Typography is imported
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import BlockIcon from '@mui/icons-material/Block';
import axios from 'axios';

const UserAccountsTable = ({ users, refreshUsers }) => {
  const [editUser, setEditUser] = useState(null);
  const [suspendUser, setSuspendUser] = useState(null);
  const [updatedUser, setUpdatedUser] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleOpenEdit = (user) => {
    setEditUser(user);
    setUpdatedUser(user);
    setError('');
    setSuccess('');
  };

  const handleCloseEdit = () => {
    setEditUser(null);
    setUpdatedUser({});
    setError('');
    setSuccess('');
  };

  const handleUpdateUser = async () => {
    setError('');
    setSuccess('');
    try {
      await axios.put(`http://localhost:5000/api/user_admin/update_user/${editUser.username}`, updatedUser);
      setSuccess('User updated successfully');
      refreshUsers();
      handleCloseEdit();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to update user');
    }
  };

  const handleOpenSuspend = (user) => {
    setSuspendUser(user);
    setError('');
    setSuccess('');
  };

  const handleCloseSuspend = () => {
    setSuspendUser(null);
    setError('');
    setSuccess('');
  };

  const handleSuspendUser = async () => {
    setError('');
    setSuccess('');
    try {
      await axios.patch(`http://localhost:5000/api/user_admin/suspend_user/${suspendUser.username}`);
      setSuccess('User suspended successfully');
      refreshUsers();
      handleCloseSuspend();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to suspend user');
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
                <Typography>No users found.</Typography> {/* Ensure Typography is used correctly */}
              </TableCell>
            </TableRow>
          ) : (
            users.map((user, index) => (
              <TableRow key={index}>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>{user.suspended ? 'Suspended' : 'Active'}</TableCell>
                <TableCell align="right">
                  <Tooltip title="Edit">
                    <IconButton onClick={() => handleOpenEdit(user)}>
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Suspend">
                    <IconButton onClick={() => handleOpenSuspend(user)}>
                      <BlockIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
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
          <TextField
            margin="dense"
            label="Role"
            name="role"
            fullWidth
            variant="standard"
            value={updatedUser.role || ''}
            onChange={(e) => setUpdatedUser({ ...updatedUser, role: e.target.value })}
            helperText="e.g., admin, buyer, seller, used_car_agent"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEdit}>Cancel</Button>
          <Button onClick={handleUpdateUser} variant="contained" color="primary">
            Update
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
          <Button onClick={handleSuspendUser} variant="contained" color="secondary">
            Suspend
          </Button>
        </DialogActions>
      </Dialog>
    </TableContainer>
  );
};

export default UserAccountsTable;
