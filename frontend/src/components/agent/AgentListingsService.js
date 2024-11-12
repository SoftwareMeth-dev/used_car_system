// src/services/AgentListingsService.js
import axios from "axios";
import config from "../config";

const AgentListingsService = {
  async getAllListings() {
    try {
      const response = await axios.get(`${config.API_BASE_URL}/view/listings`);
      return response.data;
    } catch (error) {
      console.error("Error fetching listings:", error);
      throw error;
    }
  },

  async createListing(listingData) {
    try {
      const response = await axios.post(
        `${config.API_BASE_URL}/used_car_agent/create_listing`,
        listingData
      );
      return response.data;
    } catch (error) {
      console.error("Error creating listing:", error);
      throw error;
    }
  },

  async updateListing(listingId, listingData) {
    try {
      const response = await axios.put(
        `${config.API_BASE_URL}/used_car_agent/update_listing/${listingId}`,
        listingData
      );
      return response.data;
    } catch (error) {
      console.error("Error updating listing:", error);
      throw error;
    }
  },

  async deleteListing(listingId) {
    try {
      const response = await axios.delete(
        `${config.API_BASE_URL}/used_car_agent/delete_listing/${listingId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error deleting listing:", error);
      throw error;
    }
  },

  async searchListings(query) {
    try {
      const response = await axios.get(
        `${config.API_BASE_URL}/used_car_agent/search_listings`,
        { params: { query } }
      );
      return response.data;
    } catch (error) {
      console.error("Error searching listings:", error);
      throw error;
    }
  },

  async getAgentReviews(agentId) {
    try {
      const response = await axios.get(
        `${config.API_BASE_URL}/used_car_agent/view_reviews/${agentId}`
      );
      return response.data.reviews; // Assuming the backend response is { reviews: [...] }
    } catch (error) {
      console.error("Error fetching agent reviews:", error);
      throw error;
    }
  },
};

export default AgentListingsService;
