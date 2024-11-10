// src/services/RateAgentService.js
import axios from "axios";
import config from "../config";

const RateAgentService = {
  async submitAgentReview(review) {
    try {
      const response = await axios.post(
        `${config.API_BASE_URL}/api/seller/rate_review_agent`,
        review
      );
      return response.data;
    } catch (error) {
      console.error("Error submitting review:", error);
      throw error;
    }
  },
};

export default RateAgentService;
