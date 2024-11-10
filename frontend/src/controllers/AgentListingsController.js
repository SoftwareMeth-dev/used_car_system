// src/controllers/AgentListingsController.js
import AgentListingsService from "../services/AgentListingsService";

const AgentListingsController = {
  async fetchAllListings() {
    try {
      const listings = await AgentListingsService.getAllListings();
      return listings;
    } catch (error) {
      console.error("Error fetching agent listings:", error);
      throw error;
    }
  },

  async createListing(listingData) {
    try {
      const createdListing = await AgentListingsService.createListing(
        listingData
      );
      return createdListing;
    } catch (error) {
      console.error("Error creating listing:", error);
      throw error;
    }
  },

  async updateListing(listingId, listingData) {
    try {
      const updatedListing = await AgentListingsService.updateListing(
        listingId,
        listingData
      );
      return updatedListing;
    } catch (error) {
      console.error("Error updating listing:", error);
      throw error;
    }
  },

  async deleteListing(listingId) {
    try {
      const deletedListing = await AgentListingsService.deleteListing(
        listingId
      );
      return deletedListing;
    } catch (error) {
      console.error("Error deleting listing:", error);
      throw error;
    }
  },
};

export default AgentListingsController;
