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
        listing => new CarListing(listing._id, listing.make, listing.model, listing.price, listing.details)
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

  async saveToShortlist(listingId) {
    if (!this.buyer) await this.fetchBuyerData();
    if (!this.buyer) {
      console.error("No buyer data available to save to shortlist.");
      return;
    }
    try {
      await axios.post(`${API_BASE_URL}/save_listing`, {
        user_id: this.buyer.id,  // Ensure correct user ID is passed
        listing_id: listingId
      });
    } catch (error) {
      console.error("Error saving to shortlist:", error);
    }
  }

  async getShortlist() {
    if (!this.buyer) await this.fetchBuyerData();
    if (!this.buyer) {
      console.error("No buyer data available to fetch shortlist.");
      return [];
    }
    try {
      const response = await axios.get(`${API_BASE_URL}/view_shortlist`, { params: { user_id: this.buyer.id } });
      return response.data.map(
        listing => new CarListing(listing._id, listing.make, listing.model, listing.price, listing.details)
      );
    } catch (error) {
      console.error("Error fetching shortlist:", error);
      return [];
    }
  }

  async searchShortlist(query) {
    if (!this.buyer) await this.fetchBuyerData();
    if (!this.buyer) {
      console.error("No buyer data available to search shortlist.");
      return [];
    }
    try {
      const response = await axios.get(`${API_BASE_URL}/search_shortlist`, { params: { user_id: this.buyer.id, query } });
      return response.data.map(
        listing => new CarListing(listing._id, listing.make, listing.model, listing.price, listing.details)
      );
    } catch (error) {
      console.error("Error searching shortlist:", error);
      return [];
    }
  }

  logout() {
    localStorage.removeItem('user');  // Remove user data from localStorage
    this.buyer = null; // Reset buyer information in the controller
  }
}

export default new BuyerController();
