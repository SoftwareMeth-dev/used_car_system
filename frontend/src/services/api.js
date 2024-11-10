import axios from 'axios';

// Use an environment variable for the API base URL, defaulting to localhost if not set
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// User and Profile Management Functions (User Admin)
export const login = (credentials) => api.post('/user_admin/login', credentials);

export const createUser = (userData) => api.post('/user_admin/create_user', userData);

export const viewUsers = (params) => api.get('/user_admin/view_users', { params });

export const updateUser = (username, updateData) => api.put(`/user_admin/update_user/${username}`, updateData);

export const suspendUser = (username) => api.patch(`/user_admin/suspend_user/${username}`);

export const createProfile = (profileData) => api.post('/user_admin/create_profile', profileData);

export const viewProfiles = (params) => api.get('/user_admin/view_profiles', { params });

export const updateProfile = (role, updateData) => api.put(`/user_admin/update_profile/${role}`, updateData);

export const suspendProfile = (role) => api.patch(`/user_admin/suspend_profile/${role}`);

// Buyer Functions (Mapped to each file in controllers/buyer)

// View all car listings
export const viewListings = () => api.get('/buyer/view_listings');

// Search for car listings
export const searchListings = (query) => api.get('/buyer/search_cars', { params: { query } });

// Save a listing to the user's shortlist
export const saveToShortlist = (userId, listingId) => 
  api.post('/buyer/save_listing', { user_id: userId, listing_id: listingId });

// Search the user's shortlist by query
export const searchShortlist = (userId, query) => 
  api.get('/buyer/search_shortlist', { params: { user_id: userId, query } });

// Retrieve the user's shortlist
export const getShortlist = (userId) => api.get('/buyer/view_shortlist', { params: { user_id: userId } });
