// src/services/SellerMetricsService.js
import axios from "axios";
import config from "../config";

const SellerMetricsService = {
  async getMetrics(listingId) {
    try {
      const response = await axios.get(
        `${config.API_BASE_URL}/seller/get_metrics/${listingId}`
      );
      return response.data.metrics;
    } catch (error) {
      console.error("Error fetching metrics:", error);
      throw error;
    }
  },

  async trackView(listingId) {
    try {
      const response = await axios.post(
        `${config.API_BASE_URL}/seller/track_view`,
        { listing_id: listingId }
      );
      return response.data;
    } catch (error) {
      console.error("Error tracking view:", error);
      throw error;
    }
  },

  async trackShortlist(listingId) {
    try {
      const response = await axios.post(
        `${config.API_BASE_URL}/seller/track_shortlist`,
        { listing_id: listingId }
      );
      return response.data;
    } catch (error) {
      console.error("Error tracking shortlist:", error);
      throw error;
    }
  },
};

export default SellerMetricsService;
