// src/controllers/BuyerController.js
import axios from 'axios';
import Buyer from '../entities/Buyer';
import CarListing from '../entities/CarListing';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000/api/buyer";

class BuyerController {
  constructor() {
    this.buyer = null;
  }

  async fetchBuyerData() {
    try {
      const userData = JSON.parse(localStorage.getItem("user"));
      if (userData) {
        this.buyer = new Buyer(userData.id, userData.username, userData.email);
      }
      return this.buyer;
    } catch (error) {
      console.error("Error fetching buyer data:", error);
      return null;
    }
  }

  async getListings() {
    try {
      const response = await axios.get(`${API_BASE_URL}/view_listings`);
      return response.data.map(
        listing => new CarListing(listing._id, listing.make, listing.model, listing.price, listing.details, listing.agent_id)
      );
    } catch (error) {
      console.error("Error fetching listings:", error);
      return [];
    }
  }

  async searchListings(query) {
    try {
      const response = await axios.get(`${API_BASE_URL}/search_cars`, { params: { query } });
      return response.data.map(
        listing => new CarListing(listing._id, listing.make, listing.model, listing.price, listing.details)
      );
    } catch (error) {
      console.error("Error searching listings:", error);
      return [];
    }
  }

  async saveToShortlist(data) {
    if (!this.buyer) await this.fetchBuyerData();
    if (!this.buyer) {
      console.error("No buyer data available to save to shortlist.");
      return;
    }
    try {
      await axios.post(`${API_BASE_URL}/save_listing`, 
        data
      );
    } catch (error) {
      console.error("Error saving to shortlist:", error);
    }
  }

  async getShortlist(username) {
    console.log(username)
    if (!this.buyer) await this.fetchBuyerData();
    if (!this.buyer) {
      console.error("No buyer data available to fetch shortlist.");
      return [];
    }
    try {
      const response = await axios.get(`${API_BASE_URL}/view_shortlist`, { params: { user_id: username } });

      const car = await axios.get(`${API_BASE_URL}/view_listings`);

      console.log(response.data);
      // Use the response data as the array of shortlisted IDs
      const shortlistedIds = response.data;

      // Filter car listings based on shortlisted IDs
      const shortlistedCars = car.data
        .filter(listing => shortlistedIds.includes(listing._id))
        .map(listing => new CarListing(listing._id, listing.make, listing.model, listing.price, listing.details));
      return shortlistedCars;
    } catch (error) {
      console.error("Error fetching shortlist:", error);
      return [];
    }
  }

  async searchShortlist(username,query) {
    console.log(query)
    if (!this.buyer) await this.fetchBuyerData();
    console.log(0)
    if (!this.buyer) {
      console.error("No buyer data available to search shortlist.");
      return [];
    }
    try {
      const response = await axios.get(`${API_BASE_URL}/search_shortlist`, { params: { user_id: username, query } });
      return response.data.map(
        listing => new CarListing(listing._id, listing.make, listing.model, listing.price, listing.details)
      );
    } catch (error) {
      console.error("Error searching shortlist:", error);
      return [];
    }
  }


  async fetchReviews (agentId) {
    try {
      const response = await axios.get(`http://localhost:5000/api/used_car_agent/view_reviews/${agentId}`);
      console.log(response)
      return response
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  };


  logout() {
    localStorage.removeItem('user');  // Remove user data from localStorage
    this.buyer = null; // Reset buyer information in the controller
  }
}

export default new BuyerController();
