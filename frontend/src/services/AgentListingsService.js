// src/services/AgentListingsService.js
import axios from "axios";
import config from "../config";

const AgentListingsService = {
  async createListing(listing) {
    return axios
      .post(`${config.API_BASE_URL}/used_car_agent/create_listing`, listing)
      .then((response) => response.data);
  },
  async getAllListings() {
    return axios
      .get(`${config.API_BASE_URL}/view/listings`)
      .then((response) => response.data);
  },
  async getListingDetails(listingId) {
    return axios
      .get(`${config.API_BASE_URL}/used_car_agent/listing/${listingId}`)
      .then((response) => response.data);
  },
  async getAgentReviews() {
    return axios
      .get(`${config.API_BASE_URL}/used_car_agent/view_reviews`)
      .then((response) => response.data);
  },
};

export default AgentListingsService;
