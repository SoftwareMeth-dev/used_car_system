// src/services/SellerMetricsService.js
import axios from "axios";
import config from "../config"; // Assuming you have a config file with the API base URL

const SellerMetricsService = {
  async getMetrics(listingId) {
    try {
      const response = await axios.get(
        `${config.API_BASE_URL}/api/seller/get_metrics/${listingId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching metrics:", error);
      throw error;
    }
  },
};

export default SellerMetricsService;
