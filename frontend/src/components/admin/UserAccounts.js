// src/components/admin/UserAccounts.js
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
import UserAccountsTable from './UserAccountsTable';

const UserAccounts = () => {
  const [users, setUsers] = useState([]);
  const [openCreate, setOpenCreate] = useState(false);
  const [newUser, setNewUser] = useState({
    username: '',
    password: '',
    email: '',
    role: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filters, setFilters] = useState({
    username: '',
    email: '',
    role: '',
    status: '',
  });
  const [loading, setLoading] = useState(false);
  const [availableRoles, setAvailableRoles] = useState([]); // For dynamic role options

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

  // Function to fetch users based on filters
  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (filters.username) params.username = filters.username;
      if (filters.email) params.email = filters.email;
      if (filters.role) params.role = filters.role;
      if (filters.status) params.status = filters.status;

      const response = await axios.get('http://localhost:5000/api/user_admin/view_users', { params });
      setUsers(response.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  // Fetch users and available roles on component mount
  useEffect(() => {
    fetchAvailableRoles();
    fetchUsers();
    // eslint-disable-next-line
  }, []);

  // Handle input changes for filters
  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  // Apply filters
  const handleApplyFilters = () => {
    fetchUsers();
  };

  // Clear all filters
  const handleClearFilters = () => {
    setFilters({
      username: '',
      email: '',
      role: '',
      status: '',
    });
    fetchUsers();
  };

  // Open create user dialog
  const handleOpenCreate = () => {
    setOpenCreate(true);
  };

  // Close create user dialog
  const handleCloseCreate = () => {
    setOpenCreate(false);
    setNewUser({
      username: '',
      password: '',
      email: '',
      role: '',
    });
    setError('');
    setSuccess('');
  };

  // Handle creating a new user
  const handleCreateUser = async () => {
    setError('');
    setSuccess('');
    try {
      // Basic validation
      if (!newUser.username || !newUser.password || !newUser.email || !newUser.role) {
        setError('All fields are required');
        return;
      }

      await axios.post('http://localhost:5000/api/user_admin/create_user', newUser);
      setSuccess('User created successfully');
      fetchUsers(); // Refresh the user list
      handleCloseCreate();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to create user');
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        User Accounts
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 2 }}>
        {/* Filter Section */}
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            label="Username"
            name="username"
            value={filters.username}
            onChange={handleFilterChange}
            variant="outlined"
            size="small"
          />
          <TextField
            label="Email"
            name="email"
            value={filters.email}
            onChange={handleFilterChange}
            variant="outlined"
            size="small"
          />
          <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
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
                <MenuItem key={index} value={role}>{role.charAt(0).toUpperCase() + role.slice(1)}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Status</InputLabel>
            <Select
              label="Status"
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
            >
              <MenuItem value="">
                <em>All</em>
              </MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="suspended">Suspended</MenuItem>
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
            Create User
          </Button>
        </Box>
      </Box>
      {/* Display error or success messages */}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      {/* Display loading indicator or user table */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <UserAccountsTable users={users} refreshUsers={fetchUsers} />
      )}

      {/* Create User Dialog */}
      <Dialog open={openCreate} onClose={handleCloseCreate}>
        <DialogTitle>Create New User</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Username"
            name="username"
            fullWidth
            variant="standard"
            value={newUser.username}
            onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Password"
            name="password"
            type="password"
            fullWidth
            variant="standard"
            value={newUser.password}
            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Email"
            name="email"
            type="email"
            fullWidth
            variant="standard"
            value={newUser.email}
            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
          />
          <FormControl fullWidth variant="standard" margin="dense">
            <InputLabel>Role</InputLabel>
            <Select
              label="Role"
              name="role"
              value={newUser.role}
              onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {availableRoles.map((role, index) => (
                <MenuItem key={index} value={role}>{role.charAt(0).toUpperCase() + role.slice(1)}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCreate}>Cancel</Button>
          <Button onClick={handleCreateUser} variant="contained" color="primary">
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );  
};

export default UserAccounts;
