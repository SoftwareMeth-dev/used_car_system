// src/services/SellerListingsService.js
import axios from "axios";
import config from "../config";

const SellerListingsService = {
  async getListingById(listingId) {
    try {
      const response = await axios.get(
        `${config.API_BASE_URL}/seller/listings/${listingId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching listing details:", error);
      throw error;
    }
  },
};

export default SellerListingsService;
