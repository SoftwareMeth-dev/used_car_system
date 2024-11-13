// src/services/SellerListingsService.js
import axios from "axios";
import config from "../config";

const SellerListingsService = {
  // Fetch a single listing by ID
  async getListingById(listingId) {
    try {
      const response = await axios.get(
        `${config.API_BASE_URL}/api/seller/listings/${listingId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching listing details:", error);
      throw error;
    }
  },

  // Fetch all listings (if needed for a listing overview page)
  async getAllListings() {
    try {
      const response = await axios.get(
        `${config.API_BASE_URL}/api/seller/listings`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching all listings:", error);
      throw error;
    }
  },

  // Create a new listing
  async createListing(listingData) {
    try {
      const response = await axios.post(
        `${config.API_BASE_URL}/api/seller/create_listing`,
        listingData
      );
      return response.data;
    } catch (error) {
      console.error("Error creating listing:", error);
      throw error;
    }
  },

  // Update an existing listing by ID
  async updateListing(listingId, listingData) {
    try {
      const response = await axios.put(
        `${config.API_BASE_URL}/api/seller/update_listing/${listingId}`,
        listingData
      );
      return response.data;
    } catch (error) {
      console.error("Error updating listing:", error);
      throw error;
    }
  },

  // Delete a listing by ID
  async deleteListing(listingId) {
    try {
      const response = await axios.delete(
        `${config.API_BASE_URL}/api/seller/delete_listing/${listingId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error deleting listing:", error);
      throw error;
    }
  },
};

export default SellerListingsService;
