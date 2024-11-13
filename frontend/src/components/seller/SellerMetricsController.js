// src/controllers/SellerMetricsController.js
import SellerMetricsService from "../services/SellerMetricsService";

const SellerMetricsController = {
  /**
   * Fetches metrics related to a specific listing (views and shortlists).
   * @param {String} listingId - The ID of the listing to fetch metrics for.
   * @returns {Object} Metrics data with view and shortlist counts.
   */
  async fetchMetrics(listingId) {
    try {
      const metrics = await SellerMetricsService.getMetrics(listingId);
      return metrics;
    } catch (error) {
      console.error("Error fetching seller metrics:", error);
      throw error;
    }
  },

  /**
   * Tracks a view event for a specific listing.
   * @param {String} listingId - The ID of the listing to track the view for.
   * @returns {Boolean} Returns true if tracking was successful.
   */
  async trackView(listingId) {
    try {
      await SellerMetricsService.trackView({ listing_id: listingId });
      return true;
    } catch (error) {
      console.error("Error tracking view:", error);
      throw error;
    }
  },

  /**
   * Tracks a shortlist event for a specific listing.
   * @param {String} listingId - The ID of the listing to track the shortlist for.
   * @returns {Boolean} Returns true if tracking was successful.
   */
  async trackShortlist(listingId) {
    try {
      await SellerMetricsService.trackShortlist({ listing_id: listingId });
      return true;
    } catch (error) {
      console.error("Error tracking shortlist:", error);
      throw error;
    }
  },
};

export default SellerMetricsController;
