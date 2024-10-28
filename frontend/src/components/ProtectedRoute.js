// src/components/ProtectedRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, roles }) => {
  const userData = localStorage.getItem('user');
  if (!userData) {
    return <Navigate to="/" replace />;
  }

  try {
    const user = JSON.parse(userData);
    const userRole = user.profile.role;

    if (roles && !roles.includes(userRole)) {
      return <Navigate to="/" replace />;
    }

    return children;
  } catch (error) {
    console.error('Error parsing user data:', error);
    return <Navigate to="/" replace />;
  }
};

export default ProtectedRoute;
