import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

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
export const viewListings = () => api.get('/buyer/view_listings');

export const searchListings = (query) => api.get('/buyer/search_cars', { params: { query } });

export const saveToShortlist = (userId, listingId) => api.post('/buyer/save_listing', { user_id: userId, listing_id: listingId });

export const searchShortlist = (userId, query) => api.get('/buyer/search_shortlist', { params: { user_id: userId, query } });

export const getShortlist = (userId) => api.get('/buyer/view_shortlist', { params: { user_id: userId } });
