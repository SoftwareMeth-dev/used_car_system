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
  Snackbar, // Import Snackbar
  Alert as MuiAlert, // Import Alert for Snackbar
} from '@mui/material';
import axios from 'axios';
import UserAccountsTable from './UserAccountsTable';
import config from '../../config';

const MuiAlertComponent = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

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
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success', // 'success' | 'error' | 'warning' | 'info'
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
      setSnackbar({
        open: true,
        message: 'Failed to fetch available roles. Using default roles.',
        severity: 'warning',
      });
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

      const response = await axios.get(`${config.API_BASE_URL}/user_admin/view_users`, { params });
      setUsers(response.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch users');
      setSnackbar({
        open: true,
        message: 'Failed to fetch users.',
        severity: 'error',
      });
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
        setSnackbar({
          open: true,
          message: 'All fields are required.',
          severity: 'error',
        });
        return;
      }

      const response = await axios.post(`${config.API_BASE_URL}/user_admin/create_user`, newUser);

      if (response.status === 200 && response.data === true) { // Check the boolean response
        setSuccess('User created successfully');
        setSnackbar({
          open: true,
          message: 'User created successfully.',
          severity: 'success',
        });
        fetchUsers(); // Refresh the user list
        handleCloseCreate();
      } else {
        setError('Failed to create user');
        setSnackbar({
          open: true,
          message: 'Failed to create user.',
          severity: 'error',
        });
      }
    } catch (err) {
      console.error(err);
      // Extract error message from response if available
      if (err.response && err.response.status === 400) {
        setError('User already exists or invalid data provided');
        setSnackbar({
          open: true,
          message: 'User already exists or invalid data provided.',
          severity: 'error',
        });
      } else {
        setError('Failed to create user');
        setSnackbar({
          open: true,
          message: 'Failed to create user.',
          severity: 'error',
        });
      }
    }
  };

  // Handle closing the Snackbar
  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
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
      {/* Remove existing Alerts since we'll use Snackbars */}
      {/* {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>} */}
      {/* Display loading indicator or user table */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <UserAccountsTable users={users} refreshUsers={fetchUsers} setSnackbar={setSnackbar} />
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
          <Button onClick={handleCreateUser} variant="contained" color="primary" disabled={loading}>
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

export default UserAccounts;
