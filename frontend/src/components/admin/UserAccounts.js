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
} from '@mui/material';
import axios from 'axios';
import UserAccountsTable from './UserAccountsTable';
import SearchBar from '../common/SearchBar';


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
  const [searchQuery, setSearchQuery] = useState('');
  
  const fetchUsers = async (query = '') => {
    try {
      const response = await axios.get(`http://localhost:5000/api/user_admin/view_users`, {
        params: { username: query },
      });
      setUsers([response.data]); // Assuming `view_users` returns a single user based on username
    } catch (err) {
      console.error(err);
      setError('Failed to fetch users');
    }
  };
  
  useEffect(() => {
    fetchUsers();
  }, []);
  
  const handleOpenCreate = () => {
    setOpenCreate(true);
  };
  
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
  
  const handleCreateUser = async () => {
    setError('');
    setSuccess('');
    try {
      await axios.post('http://localhost:5000/api/user_admin/create_user', newUser);
      setSuccess('User created successfully');
      fetchUsers(); // Refresh the user list
      handleCloseCreate();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to create user');
    }
  };
  
  const handleSearch = () => {
    fetchUsers(searchQuery);
  };
  
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        User Accounts
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <SearchBar
          placeholder="Search by username"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onSearch={handleSearch}
        />
        <Button variant="contained" color="primary" onClick={handleOpenCreate}>
          Create User
        </Button>
      </Box>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      <UserAccountsTable users={users} refreshUsers={fetchUsers} />
      
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
          <TextField
            margin="dense"
            label="Role"
            name="role"
            fullWidth
            variant="standard"
            value={newUser.role}
            onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
            helperText="e.g., admin, buyer, seller, used_car_agent"
          />
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
