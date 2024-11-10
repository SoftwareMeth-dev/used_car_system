// src/components/AdminDashboard.js

import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  CircularProgress,
  TextField,
  Typography,
  AppBar,
  Toolbar,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TablePagination,
  Snackbar, // Import Snackbar
  Alert,    // Import Alert for use within Snackbar
} from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import config from '../config';

// Define the width of the sidebar drawer
const drawerWidth = 240;

// Regular expression for basic email validation
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Helper function to format snake_case to Proper Case
const formatLabel = (str) => {
  return str
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Define all possible rights with snake_case and Proper Case
const rightsOptions = [
  { value: 'create_user', label: 'Create User' },
  { value: 'view_user', label: 'View User' },
  { value: 'update_user', label: 'Update User' },
  { value: 'suspend_user', label: 'Suspend User' },
  { value: 'search_user', label: 'Search User' },
  { value: 'manage_profiles', label: 'Manage Profiles' },
  { value: 'create_listing', label: 'Create Listing' },
  { value: 'view_listing', label: 'View Listing' },
  { value: 'update_listing', label: 'Update Listing' },
  { value: 'delete_listing', label: 'Delete Listing' },
  { value: 'search_listing', label: 'Search Listing' },
  { value: 'search_cars', label: 'Search Cars' },
  { value: 'view_listings', label: 'View Listings' },
  { value: 'save_shortlist', label: 'Save Shortlist' },
  { value: 'search_shortlist', label: 'Search Shortlist' },
  { value: 'view_shortlist', label: 'View Shortlist' },
  { value: 'use_loan_calculator', label: 'Use Loan Calculator' },
  { value: 'track_views', label: 'Track Views' },
  { value: 'track_shortlists', label: 'Track Shortlists' },
  { value: 'rate_review_agents', label: 'Rate Review Agents' },
];

const AdminDashboard = () => {
  const navigate = useNavigate();

  // State for Sidebar Navigation
  const [currentView, setCurrentView] = useState('users'); // 'users' or 'profiles'

  // General States
  // Remove the existing message state
  // const [message, setMessage] = useState({ type: '', text: '' });

  // Add Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success', // 'success', 'error', 'warning', 'info'
  });

  const [loading, setLoading] = useState(false);

  // States for User Accounts
  const [users, setUsers] = useState([]);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userPage, setUserPage] = useState(0);
  const [userRowsPerPage, setUserRowsPerPage] = useState(5);

  // States for User Profiles
  const [profiles, setProfiles] = useState([]);
  const [profileSearchQuery, setProfileSearchQuery] = useState('');
  const [profilePage, setProfilePage] = useState(0);
  const [profileRowsPerPage, setProfileRowsPerPage] = useState(5);

  // States for Dialogs
  // Users
  const [openCreateUser, setOpenCreateUser] = useState(false);
  const [newUser, setNewUser] = useState({ username: '', password: '', email: '', role: '' });
  const [userErrors, setUserErrors] = useState({});

  const [openUpdateUser, setOpenUpdateUser] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [updatedUserData, setUpdatedUserData] = useState({ email: '', role: '' });
  const [updateUserErrors, setUpdateUserErrors] = useState({});

  const [openSuspendUser, setOpenSuspendUser] = useState(false);
  const [userToSuspend, setUserToSuspend] = useState(null);

  const [openReenableUser, setOpenReenableUser] = useState(false);
  const [userToReenable, setUserToReenable] = useState(null);

  // Profiles
  const [openCreateProfile, setOpenCreateProfile] = useState(false);
  const [newProfile, setNewProfile] = useState({ role: '', rights: [] });
  const [profileErrors, setProfileErrors] = useState({});

  const [openUpdateProfile, setOpenUpdateProfile] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [updatedProfileData, setUpdatedProfileData] = useState({ rights: [] });
  const [updateProfileErrors, setUpdateProfileErrors] = useState({});

  const [openSuspendProfile, setOpenSuspendProfile] = useState(false);
  const [profileToSuspend, setProfileToSuspend] = useState(null);

  const [openReenableProfile, setOpenReenableProfile] = useState(false);
  const [profileToReenable, setProfileToReenable] = useState(null);

  // Handle Sidebar Navigation
  const handleNavigation = (view) => {
    setCurrentView(view);
    // Reset Snackbar messages on view change
    setSnackbar({ ...snackbar, open: false });
  };

  // Fetch Users
  const fetchUsers = async (query = '') => {
    setLoading(true);
    // setMessage({ type: '', text: '' }); // Remove Alert reset
    try {
      const endpoint = query ? '/search_users' : '/view_users';
      const response = await axios.get(`${config.API_BASE_URL}/user_admin${endpoint}`, {
        params: { query },
      });
      if (response.status === 200) {
        setUsers(response.data.users);
        if (query) {
          setSnackbar({
            open: true,
            message: `Found ${response.data.users.length} user(s).`,
            severity: 'success',
          });
        }
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setSnackbar({
        open: true,
        message: 'Failed to fetch users.',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch Profiles
  const fetchProfiles = async (query = '') => {
    setLoading(true);
    // setMessage({ type: '', text: '' }); // Remove Alert reset
    try {
      const endpoint = query ? '/search_profiles' : '/view_profiles';
      const response = await axios.get(`${config.API_BASE_URL}/user_admin${endpoint}`, {
        params: { query },
      });
      if (response.status === 200) {
        setProfiles(response.data.profiles);
        if (query) {
          setSnackbar({
            open: true,
            message: `Found ${response.data.profiles.length} profile(s).`,
            severity: 'success',
          });
        }
      }
    } catch (error) {
      console.error('Error fetching profiles:', error);
      setSnackbar({
        open: true,
        message: 'Failed to fetch profiles.',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  // Initial Fetch
  useEffect(() => {
    fetchUsers();
    fetchProfiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Remove the auto-hide Alert effect since Snackbar handles it
  /*
  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 5000); // 5 seconds
      return () => clearTimeout(timer);
    }
  }, [message]);
  */

  // ----------------------- User Accounts Functions -----------------------

  // Validate Create User Form
  const validateCreateUser = () => {
    const errors = {};
    if (!newUser.username.trim()) errors.username = 'Username is required.';
    if (!newUser.password.trim()) errors.password = 'Password is required.';
    if (!newUser.email.trim()) {
      errors.email = 'Email is required.';
    } else if (!emailRegex.test(newUser.email)) {
      errors.email = 'Invalid email format.';
    }
    if (!newUser.role.trim()) errors.role = 'Role is required.';
    setUserErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Create User Account
  const handleCreateUser = async () => {
    if (!validateCreateUser()) return;
    setLoading(true);
    // setMessage({ type: '', text: '' }); // Remove Alert reset
    try {
      const response = await axios.post(`${config.API_BASE_URL}/user_admin/create_user`, newUser);
      if (response.status === 201) {
        setSnackbar({
          open: true,
          message: 'User created successfully.',
          severity: 'success',
        });
        fetchUsers(); // Refresh users
        setOpenCreateUser(false); // Close dialog
        setNewUser({ username: '', password: '', email: '', role: '' }); // Reset form
        setUserErrors({});
      }
    } catch (error) {
      console.error('Error creating user:', error);
      if (error.response && error.response.data && error.response.data.error) {
        setSnackbar({
          open: true,
          message: JSON.stringify(error.response.data.error),
          severity: 'error',
        });
      } else {
        setSnackbar({
          open: true,
          message: 'Failed to create user.',
          severity: 'error',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Validate Update User Form
  const validateUpdateUser = () => {
    const errors = {};
    if (!updatedUserData.email.trim()) {
      errors.email = 'Email is required.';
    } else if (!emailRegex.test(updatedUserData.email)) {
      errors.email = 'Invalid email format.';
    }
    if (!updatedUserData.role.trim()) errors.role = 'Role is required.';
    setUpdateUserErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Update User Account
  const handleUpdateUser = async () => {
    if (!validateUpdateUser()) return;
    setLoading(true);
    // setMessage({ type: '', text: '' }); // Remove Alert reset
    try {
      const response = await axios.put(
        `${config.API_BASE_URL}/user_admin/update_user/${selectedUser.username}`,
        updatedUserData
      );
      if (response.status === 200) {
        setSnackbar({
          open: true,
          message: 'User updated successfully.',
          severity: 'success',
        });
        fetchUsers(); // Refresh users
        setOpenUpdateUser(false); // Close dialog
        setSelectedUser(null);
        setUpdatedUserData({ email: '', role: '' });
        setUpdateUserErrors({});
      }
    } catch (error) {
      console.error('Error updating user:', error);
      if (error.response && error.response.data && error.response.data.error) {
        setSnackbar({
          open: true,
          message: JSON.stringify(error.response.data.error),
          severity: 'error',
        });
      } else {
        setSnackbar({
          open: true,
          message: 'Failed to update user.',
          severity: 'error',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Suspend User Account
  const handleSuspendUser = async () => {
    setLoading(true);
    // setMessage({ type: '', text: '' }); // Remove Alert reset
    try {
      const response = await axios.patch(`${config.API_BASE_URL}/user_admin/suspend_user/${userToSuspend.username}`);
      if (response.status === 200) {
        setSnackbar({
          open: true,
          message: `User '${userToSuspend.username}' suspended successfully.`,
          severity: 'success',
        });
        fetchUsers(); // Refresh users
        setOpenSuspendUser(false); // Close dialog
        setUserToSuspend(null);
      }
    } catch (error) {
      console.error('Error suspending user:', error);
      if (error.response && error.response.data && error.response.data.error) {
        setSnackbar({
          open: true,
          message: JSON.stringify(error.response.data.error),
          severity: 'error',
        });
      } else {
        setSnackbar({
          open: true,
          message: 'Failed to suspend user.',
          severity: 'error',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Re-enable User Account
  const handleReenableUser = async () => {
    setLoading(true);
    // setMessage({ type: '', text: '' }); // Remove Alert reset
    try {
      const response = await axios.patch(`${config.API_BASE_URL}/user_admin/reenable_user/${userToReenable.username}`);
      if (response.status === 200) {
        setSnackbar({
          open: true,
          message: `User '${userToReenable.username}' re-enabled successfully.`,
          severity: 'success',
        });
        fetchUsers(); // Refresh users
        setOpenReenableUser(false); // Close dialog
        setUserToReenable(null);
      }
    } catch (error) {
      console.error('Error re-enabling user:', error);
      if (error.response && error.response.data && error.response.data.error) {
        setSnackbar({
          open: true,
          message: JSON.stringify(error.response.data.error),
          severity: 'error',
        });
      } else {
        setSnackbar({
          open: true,
          message: 'Failed to re-enable user.',
          severity: 'error',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Search Users
  const handleSearchUsers = () => {
    fetchUsers(userSearchQuery);
    setUserPage(0); // Reset to first page after search
  };

  // ----------------------- User Profiles Functions -----------------------

  // Validate Create Profile Form
  const validateCreateProfile = () => {
    const errors = {};
    if (!newProfile.role.trim()) errors.role = 'Role is required.';
    if (newProfile.rights.length === 0) errors.rights = 'At least one right is required.';
    setProfileErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Create User Profile
  const handleCreateProfile = async () => {
    if (!validateCreateProfile()) return;
    setLoading(true);
    // setMessage({ type: '', text: '' }); // Remove Alert reset
    try {
      const payload = {
        role: newProfile.role,
        rights: newProfile.rights, // Array of snake_case rights
      };
      const response = await axios.post(`${config.API_BASE_URL}/user_admin/create_profile`, payload);
      if (response.status === 201) {
        setSnackbar({
          open: true,
          message: 'Profile created successfully.',
          severity: 'success',
        });
        fetchProfiles(); // Refresh profiles
        setOpenCreateProfile(false); // Close dialog
        setNewProfile({ role: '', rights: [] }); // Reset form
        setProfileErrors({});
      }
    } catch (error) {
      console.error('Error creating profile:', error);
      if (error.response && error.response.data && error.response.data.error) {
        setSnackbar({
          open: true,
          message: JSON.stringify(error.response.data.error),
          severity: 'error',
        });
      } else {
        setSnackbar({
          open: true,
          message: 'Failed to create profile.',
          severity: 'error',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Validate Update Profile Form
  const validateUpdateProfile = () => {
    const errors = {};
    if (updatedProfileData.rights.length === 0) errors.rights = 'At least one right is required.';
    setUpdateProfileErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Update User Profile
  const handleUpdateProfile = async () => {
    if (!validateUpdateProfile()) return;
    setLoading(true);
    // setMessage({ type: '', text: '' }); // Remove Alert reset
    try {
      const payload = {
        rights: updatedProfileData.rights, // Array of snake_case rights
      };
      const response = await axios.put(
        `${config.API_BASE_URL}/user_admin/update_profile/${selectedProfile.role}`,
        payload
      );
      if (response.status === 200) {
        setSnackbar({
          open: true,
          message: 'Profile updated successfully.',
          severity: 'success',
        });
        fetchProfiles(); // Refresh profiles
        setOpenUpdateProfile(false); // Close dialog
        setSelectedProfile(null);
        setUpdatedProfileData({ rights: [] });
        setUpdateProfileErrors({});
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      if (error.response && error.response.data && error.response.data.error) {
        setSnackbar({
          open: true,
          message: JSON.stringify(error.response.data.error),
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

  // Suspend User Profile
  const handleSuspendProfile = async () => {
    setLoading(true);
    // setMessage({ type: '', text: '' }); // Remove Alert reset
    try {
      const response = await axios.patch(`${config.API_BASE_URL}/user_admin/suspend_profile/${profileToSuspend.role}`);
      if (response.status === 200) {
        setSnackbar({
          open: true,
          message: `Profile '${formatLabel(profileToSuspend.role)}' and associated users suspended successfully.`,
          severity: 'success',
        });
        fetchProfiles(); // Refresh profiles
        fetchUsers(); // Refresh users as well
        setOpenSuspendProfile(false); // Close dialog
        setProfileToSuspend(null);
      }
    } catch (error) {
      console.error('Error suspending profile:', error);
      if (error.response && error.response.data && error.response.data.error) {
        setSnackbar({
          open: true,
          message: JSON.stringify(error.response.data.error),
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

  // Re-enable User Profile
  const handleReenableProfile = async () => {
    setLoading(true);
    // setMessage({ type: '', text: '' }); // Remove Alert reset
    try {
      const response = await axios.patch(`${config.API_BASE_URL}/user_admin/reenable_profile/${profileToReenable.role}`);
      if (response.status === 200) {
        setSnackbar({
          open: true,
          message: `Profile '${formatLabel(profileToReenable.role)}' and associated users re-enabled successfully.`,
          severity: 'success',
        });
        fetchProfiles(); // Refresh profiles
        fetchUsers(); // Refresh users as well
        setOpenReenableProfile(false); // Close dialog
        setProfileToReenable(null);
      }
    } catch (error) {
      console.error('Error re-enabling profile:', error);
      if (error.response && error.response.data && error.response.data.error) {
        setSnackbar({
          open: true,
          message: JSON.stringify(error.response.data.error),
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

  // Search Profiles
  const handleSearchProfiles = () => {
    fetchProfiles(profileSearchQuery);
    setProfilePage(0); // Reset to first page after search
  };

  // ----------------------- Logout Function -----------------------

  const handleLogout = () => {
    // Clear localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('profile');
    setSnackbar({
      open: true,
      message: 'Logged out successfully.',
      severity: 'success',
    });
    // Redirect to login page
    navigate('/');
  };

  // ----------------------- Snackbar Handler -----------------------

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  // ----------------------- Render Functions -----------------------

  // Render Users Table
  const renderUsers = () => {
    // Calculate the slice of users to display based on pagination
    const start = userPage * userRowsPerPage;
    const end = start + userRowsPerPage;
    const paginatedUsers = users.slice(start, end);

    return (
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <TextField
            label="Search Users"
            variant="outlined"
            value={userSearchQuery}
            onChange={(e) => setUserSearchQuery(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSearchUsers();
              }
            }}
            sx={{ width: '40%' }}
          />
          <Box>
            <Button variant="contained" color="primary" onClick={handleSearchUsers} sx={{ mr: 1 }}>
              Search
            </Button>
            <Button variant="contained" color="success" onClick={() => setOpenCreateUser(true)}>
              Create User
            </Button>
          </Box>
        </Box>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Username</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedUsers.length > 0 ? (
                  paginatedUsers.map((user) => (
                    <TableRow key={user.username}>
                      <TableCell>{user.username}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{formatLabel(user.role)}</TableCell>
                      <TableCell>{user.suspended ? 'Suspended' : 'Active'}</TableCell>
                      <TableCell align="center">
                        <Button
                          variant="outlined"
                          color="primary"
                          onClick={() => {
                            setSelectedUser(user);
                            setUpdatedUserData({ email: user.email, role: user.role });
                            setOpenUpdateUser(true);
                          }}
                          sx={{ mr: 1 }}
                        >
                          Update
                        </Button>
                        {!user.suspended ? (
                          <Button
                            variant="outlined"
                            color="error"
                            onClick={() => {
                              setUserToSuspend(user);
                              setOpenSuspendUser(true);
                            }}
                            sx={{ mr: 1 }}
                          >
                            Suspend
                          </Button>
                        ) : (
                          <Button
                            variant="outlined"
                            color="success"
                            onClick={() => {
                              setUserToReenable(user);
                              setOpenReenableUser(true);
                            }}
                          >
                            Re-enable
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      No users found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            {/* Pagination Controls */}
            <TablePagination
              component="div"
              count={users.length}
              page={userPage}
              onPageChange={(event, newPage) => setUserPage(newPage)}
              rowsPerPage={userRowsPerPage}
              onRowsPerPageChange={(event) => {
                setUserRowsPerPage(parseInt(event.target.value, 10));
                setUserPage(0); // Reset to first page
              }}
              rowsPerPageOptions={[5, 10, 50]}
              labelRowsPerPage="Users per page:"
              sx={{ mt: 2 }}
            />
          </>
        )}
      </Box>
    );
  };

  // Render Profiles Table
  const renderProfiles = () => {
    // Calculate the slice of profiles to display based on pagination
    const start = profilePage * profileRowsPerPage;
    const end = start + profileRowsPerPage;
    const paginatedProfiles = profiles.slice(start, end);

    return (
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <TextField
            label="Search Profiles"
            variant="outlined"
            value={profileSearchQuery}
            onChange={(e) => setProfileSearchQuery(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSearchProfiles();
              }
            }}
            sx={{ width: '40%' }}
          />
          <Box>
            <Button variant="contained" color="primary" onClick={handleSearchProfiles} sx={{ mr: 1 }}>
              Search
            </Button>
            <Button variant="contained" color="success" onClick={() => setOpenCreateProfile(true)}>
              Create Profile
            </Button>
          </Box>
        </Box>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Role</TableCell>
                  <TableCell>Rights</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedProfiles.length > 0 ? (
                  paginatedProfiles.map((profile) => (
                    <TableRow key={profile.role}>
                      <TableCell>{formatLabel(profile.role)}</TableCell>
                      <TableCell>
                        {profile.rights.map((right, index) => (
                          <Typography key={index} variant="body2">
                            {formatLabel(right)}
                          </Typography>
                        ))}
                      </TableCell>
                      <TableCell>{profile.suspended ? 'Suspended' : 'Active'}</TableCell>
                      <TableCell align="center">
                        <Button
                          variant="outlined"
                          color="primary"
                          onClick={() => {
                            setSelectedProfile(profile);
                            setUpdatedProfileData({ rights: profile.rights });
                            setOpenUpdateProfile(true);
                          }}
                          sx={{ mr: 1 }}
                        >
                          Update
                        </Button>
                        {!profile.suspended ? (
                          <Button
                            variant="outlined"
                            color="error"
                            onClick={() => {
                              setProfileToSuspend(profile);
                              setOpenSuspendProfile(true);
                            }}
                            sx={{ mr: 1 }}
                          >
                            Suspend
                          </Button>
                        ) : (
                          <Button
                            variant="outlined"
                            color="success"
                            onClick={() => {
                              setProfileToReenable(profile);
                              setOpenReenableProfile(true);
                            }}
                          >
                            Re-enable
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      No profiles found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            {/* Pagination Controls */}
            <TablePagination
              component="div"
              count={profiles.length}
              page={profilePage}
              onPageChange={(event, newPage) => setProfilePage(newPage)}
              rowsPerPage={profileRowsPerPage}
              onRowsPerPageChange={(event) => {
                setProfileRowsPerPage(parseInt(event.target.value, 10));
                setProfilePage(0); // Reset to first page
              }}
              rowsPerPageOptions={[5, 10, 50]}
              labelRowsPerPage="Profiles per page:"
              sx={{ mt: 2 }}
            />
          </>
        )}
      </Box>
    );
  };

  // ----------------------- Main Render -----------------------

  return (
    <Box sx={{ display: 'flex' }}>
      {/* Sidebar Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
        }}
      >
        <Toolbar>
          <Typography variant="h6" noWrap>
            Admin Dashboard
          </Typography>
        </Toolbar>
        <Box sx={{ overflow: 'auto' }}>
          <List>
            <ListItem disablePadding>
              <ListItemButton selected={currentView === 'users'} onClick={() => handleNavigation('users')}>
                <ListItemText primary="User Accounts" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton selected={currentView === 'profiles'} onClick={() => handleNavigation('profiles')}>
                <ListItemText primary="User Profiles" />
              </ListItemButton>
            </ListItem>
          </List>
        </Box>
      </Drawer>

      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        {/* AppBar with Logout Button */}
        <AppBar position="static" sx={{ mb: 4, width: `calc(100% - ${drawerWidth}px)`, ml: `${drawerWidth}px` }}>
          <Toolbar>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              {currentView === 'users' ? 'User Accounts' : 'User Profiles'}
            </Typography>
            <Button color="inherit" onClick={handleLogout}>
              Logout
            </Button>
          </Toolbar>
        </AppBar>

        {/* Snackbar for Messages */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>

        {/* Render Content Based on Current View */}
        {currentView === 'users' && renderUsers()}
        {currentView === 'profiles' && renderProfiles()}

        {/* ----------------------- User Dialogs ----------------------- */}

        {/* Create User Dialog */}
        <Dialog
          open={openCreateUser}
          onClose={() => { setOpenCreateUser(false); setUserErrors({}); }}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>Create New User</DialogTitle>
          <DialogContent>
            <TextField
              label="Username"
              name="username"
              fullWidth
              required
              margin="normal"
              value={newUser.username}
              onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
              error={Boolean(userErrors.username)}
              helperText={userErrors.username}
            />
            <TextField
              label="Password"
              name="password"
              type="password"
              fullWidth
              required
              margin="normal"
              value={newUser.password}
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              error={Boolean(userErrors.password)}
              helperText={userErrors.password}
            />
            <TextField
              label="Email"
              name="email"
              type="email"
              fullWidth
              required
              margin="normal"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              error={Boolean(userErrors.email)}
              helperText={userErrors.email}
            />
            <FormControl fullWidth required margin="normal" error={Boolean(userErrors.role)}>
              <InputLabel id="role-select-label">Role</InputLabel>
              <Select
                labelId="role-select-label"
                label="Role"
                value={newUser.role}
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
              >
                {profiles.map((profile) => (
                  <MenuItem key={profile.role} value={profile.role}>
                    {formatLabel(profile.role)}
                  </MenuItem>
                ))}
              </Select>
              {userErrors.role && (
                <Typography variant="caption" color="error">
                  {userErrors.role}
                </Typography>
              )}
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => { setOpenCreateUser(false); setUserErrors({}); }}>Cancel</Button>
            <Button onClick={handleCreateUser} variant="contained" color="primary" disabled={loading}>
              {loading ? <CircularProgress size={24} /> : 'Create'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Update User Dialog */}
        <Dialog
          open={openUpdateUser}
          onClose={() => { setOpenUpdateUser(false); setUpdateUserErrors({}); }}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>Update User</DialogTitle>
          <DialogContent>
            {selectedUser && (
              <>
                <Typography variant="subtitle1">Username: {selectedUser.username}</Typography>
                <TextField
                  label="Email"
                  name="email"
                  type="email"
                  fullWidth
                  required
                  margin="normal"
                  value={updatedUserData.email}
                  onChange={(e) => setUpdatedUserData({ ...updatedUserData, email: e.target.value })}
                  error={Boolean(updateUserErrors.email)}
                  helperText={updateUserErrors.email}
                />
                <FormControl fullWidth required margin="normal" error={Boolean(updateUserErrors.role)}>
                  <InputLabel id="update-role-select-label">Role</InputLabel>
                  <Select
                    labelId="update-role-select-label"
                    label="Role"
                    value={updatedUserData.role}
                    onChange={(e) => setUpdatedUserData({ ...updatedUserData, role: e.target.value })}
                  >
                    {profiles.map((profile) => (
                      <MenuItem key={profile.role} value={profile.role}>
                        {formatLabel(profile.role)}
                      </MenuItem>
                    ))}
                  </Select>
                  {updateUserErrors.role && (
                    <Typography variant="caption" color="error">
                      {updateUserErrors.role}
                    </Typography>
                  )}
                </FormControl>
              </>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => { setOpenUpdateUser(false); setUpdateUserErrors({}); }}>Cancel</Button>
            <Button onClick={handleUpdateUser} variant="contained" color="primary" disabled={loading}>
              {loading ? <CircularProgress size={24} /> : 'Update'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Suspend User Dialog */}
        <Dialog
          open={openSuspendUser}
          onClose={() => setOpenSuspendUser(false)}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>Suspend User</DialogTitle>
          <DialogContent>
            {userToSuspend && (
              <Typography>
                Are you sure you want to suspend user <strong>{userToSuspend.username}</strong>?
              </Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenSuspendUser(false)}>Cancel</Button>
            <Button onClick={handleSuspendUser} variant="contained" color="error" disabled={loading}>
              {loading ? <CircularProgress size={24} /> : 'Suspend'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Re-enable User Dialog */}
        <Dialog
          open={openReenableUser}
          onClose={() => setOpenReenableUser(false)}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>Re-enable User</DialogTitle>
          <DialogContent>
            {userToReenable && (
              <Typography>
                Are you sure you want to re-enable user <strong>{userToReenable.username}</strong>?
              </Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenReenableUser(false)}>Cancel</Button>
            <Button onClick={handleReenableUser} variant="contained" color="success" disabled={loading}>
              {loading ? <CircularProgress size={24} /> : 'Re-enable'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* ----------------------- Profile Dialogs ----------------------- */}

        {/* Create Profile Dialog */}
        <Dialog
          open={openCreateProfile}
          onClose={() => { setOpenCreateProfile(false); setProfileErrors({}); }}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>Create New Profile</DialogTitle>
          <DialogContent>
            <TextField
              label="Role"
              name="role"
              fullWidth
              required
              margin="normal"
              value={newProfile.role}
              onChange={(e) => setNewProfile({ ...newProfile, role: e.target.value })}
              error={Boolean(profileErrors.role)}
              helperText={profileErrors.role}
            />
            <FormControl fullWidth required margin="normal" error={Boolean(profileErrors.rights)}>
              <InputLabel id="rights-select-label">Rights</InputLabel>
              <Select
                labelId="rights-select-label"
                label="Rights"
                multiple
                value={newProfile.rights}
                onChange={(e) => setNewProfile({ ...newProfile, rights: e.target.value })}
                renderValue={(selected) => selected.map(right => formatLabel(right)).join(', ')}
              >
                {rightsOptions.map((right) => (
                  <MenuItem key={right.value} value={right.value}>
                    {right.label}
                  </MenuItem>
                ))}
              </Select>
              {profileErrors.rights && (
                <Typography variant="caption" color="error">
                  {profileErrors.rights}
                </Typography>
              )}
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => { setOpenCreateProfile(false); setProfileErrors({}); }}>Cancel</Button>
            <Button onClick={handleCreateProfile} variant="contained" color="primary" disabled={loading}>
              {loading ? <CircularProgress size={24} /> : 'Create'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Update Profile Dialog */}
        <Dialog
          open={openUpdateProfile}
          onClose={() => { setOpenUpdateProfile(false); setUpdateProfileErrors({}); }}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>Update Profile</DialogTitle>
          <DialogContent>
            {selectedProfile && (
              <>
                <Typography variant="subtitle1">Role: {formatLabel(selectedProfile.role)}</Typography>
                <FormControl fullWidth required margin="normal" error={Boolean(updateProfileErrors.rights)}>
                  <InputLabel id="update-rights-select-label">Rights</InputLabel>
                  <Select
                    labelId="update-rights-select-label"
                    label="Rights"
                    multiple
                    value={updatedProfileData.rights}
                    onChange={(e) => setUpdatedProfileData({ ...updatedProfileData, rights: e.target.value })}
                    renderValue={(selected) => selected.map(right => formatLabel(right)).join(', ')}
                  >
                    {rightsOptions.map((right) => (
                      <MenuItem key={right.value} value={right.value}>
                        {right.label}
                      </MenuItem>
                    ))}
                  </Select>
                  {updateProfileErrors.rights && (
                    <Typography variant="caption" color="error">
                      {updateProfileErrors.rights}
                    </Typography>
                  )}
                </FormControl>
              </>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => { setOpenUpdateProfile(false); setUpdateProfileErrors({}); }}>Cancel</Button>
            <Button onClick={handleUpdateProfile} variant="contained" color="primary" disabled={loading}>
              {loading ? <CircularProgress size={24} /> : 'Update'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Suspend Profile Dialog */}
        <Dialog
          open={openSuspendProfile}
          onClose={() => setOpenSuspendProfile(false)}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>Suspend Profile</DialogTitle>
          <DialogContent>
            {profileToSuspend && (
              <Typography>
                Are you sure you want to suspend profile <strong>{formatLabel(profileToSuspend.role)}</strong> and all associated users?
              </Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenSuspendProfile(false)}>Cancel</Button>
            <Button onClick={handleSuspendProfile} variant="contained" color="error" disabled={loading}>
              {loading ? <CircularProgress size={24} /> : 'Suspend'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Re-enable Profile Dialog */}
        <Dialog
          open={openReenableProfile}
          onClose={() => setOpenReenableProfile(false)}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>Re-enable Profile</DialogTitle>
          <DialogContent>
            {profileToReenable && (
              <Typography>
                Are you sure you want to re-enable profile <strong>{formatLabel(profileToReenable.role)}</strong> and all associated users?
              </Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenReenableProfile(false)}>Cancel</Button>
            <Button onClick={handleReenableProfile} variant="contained" color="success" disabled={loading}>
              {loading ? <CircularProgress size={24} /> : 'Re-enable'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
};

export default AdminDashboard;
