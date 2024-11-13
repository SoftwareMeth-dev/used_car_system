// src/App.js
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login";
import AdminDashboard from "./components/AdminDashboard";
import AgentDashboard from "./components/agent/AgentDashboard";
import SellerDashboard from "./components/seller/boundary/SellerDashboard";
import BuyerDashboard from "./components/BuyerDashboard";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Routes>
      {/* Login Page */}
      <Route path="/" element={<Login />} />

      {/* Admin Dashboard */}
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute roles={["user_admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      {/* Agent Dashboard */}
      <Route
        path="/used_car_agent/*"
        element={
          <ProtectedRoute roles={["used_car_agent"]}>
            <AgentDashboard />
          </ProtectedRoute>
        }
      />

      {/* Seller Dashboard */}
      <Route
        path="/seller/*"
        element={
          <ProtectedRoute roles={["seller"]}>
            <SellerDashboard />
          </ProtectedRoute>
        }
      />

      {/* Buyer Dashboard */}
      <Route
        path="/buyer/*"
        element={
          <ProtectedRoute roles={["buyer"]}>
            <BuyerDashboard />
          </ProtectedRoute>
        }
      />

      {/* Redirect any unknown routes to login */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
